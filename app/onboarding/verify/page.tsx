"use client"

import { useEffect, useRef, useState } from "react"
import { bridgeBack, bridgeNavigate, bridgeOpenSms } from "@/lib/bridge"

type Step = "phone" | "loading" | "password"

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

const OCTOMO_NUMBER = "16663538"
const OCTOMO_DISPLAY = "1666-3538"

const TERMS = [
  { key: "service", label: "이용 약관 동의", required: true },
  { key: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { key: "sensitive", label: "민감정보 수집 및 이용 동의", required: true },
  { key: "marketing", label: "마케팅 정보 수신 동의", required: false },
] as const

type TermKey = typeof TERMS[number]["key"]

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 3l14 14M8.5 8.7A2.5 2.5 0 0 0 12 12.5M5.5 5.7C3.6 7 2 10 2 10s3 6 8 6c1.8 0 3.4-.6 4.7-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M10 4c5 0 8 6 8 6a14 14 0 0 1-2 2.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-[#0073ff] border-[#0073ff]" : "border-[#d8d8d8]"
      }`}
    >
      {checked && <CheckIcon />}
    </button>
  )
}

export default function VerifyPage() {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [code] = useState(generateCode)
  const [polling, setPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // password step
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showPwConfirm, setShowPwConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({
    service: false, privacy: false, sensitive: false, marketing: false,
  })

  const rawPhone = phone.replace(/\D/g, "")
  const canSend = rawPhone.length === 11

  const pwLengthOk = password.length >= 8 && password.length <= 12
  const pwHasLetter = /[a-zA-Z]/.test(password)
  const pwHasNumber = /[0-9]/.test(password)
  const pwValid = pwLengthOk && pwHasLetter && pwHasNumber
  const pwTouched = password.length > 0
  const pwError = pwTouched && !pwValid
    ? !pwLengthOk
      ? "8~12자로 입력해주세요."
      : "영문, 숫자를 모두 포함해야 해요."
    : null

  const pwMatch = password === passwordConfirm && passwordConfirm.length > 0
  const pwConfirmTouched = passwordConfirm.length > 0
  const canFinish = pwValid && pwMatch && !submitting

  const allRequired = TERMS.filter((t) => t.required).every((t) => agreed[t.key])
  const allChecked = TERMS.every((t) => agreed[t.key])

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11)
    setPhone(formatPhone(raw))
  }

  function handleSendSms() {
    if (!canSend) return
    bridgeOpenSms(OCTOMO_NUMBER, code)
    setStep("loading")
    setPolling(true)
  }

  function toggleTerm(key: TermKey) {
    setAgreed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleAll() {
    const next = !allChecked
    setAgreed({ service: next, privacy: next, sensitive: next, marketing: next })
  }

  useEffect(() => {
    if (!polling) return
    async function check() {
      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNum: rawPhone, text: code }),
        })
        const data = await res.json()
        if (data.exists) {
          setPolling(false)
          if (intervalRef.current) clearInterval(intervalRef.current)
          localStorage.setItem("phone_verified", rawPhone)
          setStep("password")
        }
      } catch { /* keep polling */ }
    }
    check()
    intervalRef.current = setInterval(check, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [polling])

  async function handleAgreeAndFinish() {
    if (!allRequired || submitting) return
    setShowTerms(false)
    setSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone, password }),
      })
      if (res.ok || res.status === 409) {
        localStorage.setItem("user_phone", rawPhone)
        bridgeNavigate("BirthInfo")
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step: phone ──────────────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-[54px] flex items-center px-4">
          <button onClick={() => bridgeBack()} className="w-8 h-8 flex items-center justify-center text-[28px] text-[#0f0f10] leading-none">‹</button>
        </div>

        <div className="flex-1 px-5 pt-4 flex flex-col gap-6 overflow-y-auto pb-4">
          <h1 className="text-[26px] font-bold text-[#0f0f10] leading-[1.3]">
            휴대폰 번호 인증으로<br />간편하게 가입해요.
          </h1>

          {/* 전화번호 입력 */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#0f0f10]">휴대폰 번호</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-0000-0000"
              value={phone}
              onChange={handlePhoneChange}
              className="h-[52px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#bbb] outline-none focus:border-[#0f0f10] bg-white tracking-wider"
            />
            {phone.length > 0 && !canSend && (
              <p className="text-[12px] text-[#ff3b30]">올바른 휴대폰 번호를 입력해주세요.</p>
            )}
          </div>

          <ol className="flex flex-col gap-2">
            {[
              "하단 '인증 코드 보내기' 버튼을 눌러주세요.",
              "이동한 메시지 작성 창에서,\n인증 코드 메시지가 자동으로 입력되어 있어요.",
              "인증 메시지를 수정 없이 전송 후,\n화면으로 다시 돌아와 다음 절차를 진행해주세요.",
            ].map((text, i) => (
              <li key={i} className="flex gap-2 text-[15px] text-[#0f0f10] leading-[1.5]">
                <span className="shrink-0">{i + 1}.</span>
                <span style={{ whiteSpace: "pre-line" }}>{text}</span>
              </li>
            ))}
          </ol>

          {/* SMS preview card */}
          <div className="relative mx-2 mt-2">
            <div className="bg-[#f2f2f2] rounded-[16px] px-5 py-4 flex flex-col gap-1 shadow-sm">
              <p className="text-center text-[15px] font-medium text-[#0f0f10]">새로운 메시지</p>
              <p className="text-[13px] text-[#0073ff]">받는 사람 : {OCTOMO_DISPLAY}</p>
              <div className="mt-2 bg-white rounded-[12px] p-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[13px] text-[#0f0f10] font-medium">[마주] 인증문자 보내기</p>
                  <p className="text-[26px] font-bold text-[#0f0f10] tracking-widest">{code}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#34c759] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 14.25V3.75M9 3.75L4.5 8.25M9 3.75L13.5 8.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute -right-1 top-[60px] bg-[#0073ff] text-white text-[13px] font-semibold px-3 py-2 rounded-[8px] leading-[1.3] max-w-[140px]">
              입력 된 문자를 보내면<br />본인인증이 돼요.
              <div className="absolute left-[-6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-[#0073ff] border-b-[6px] border-b-transparent" />
            </div>
          </div>

          <p className="text-[13px] text-[#999] leading-normal">
            ※ 이용중인 통신 요금제에 따라 문자 메시지 발송 비용이 발생할 수 있습니다.
          </p>
        </div>

        <div className="px-5 pb-8 pt-3">
          <button
            onClick={handleSendSms}
            disabled={!canSend}
            className={`w-full h-[52px] rounded-[8px] text-[16px] font-semibold transition-colors ${
              canSend ? "bg-[#aecbff] text-[#0f0f10] active:opacity-80" : "bg-[#f1f1f1] text-[#0f0f10]"
            }`}
          >
            인증 코드 보내기
          </button>
        </div>
      </div>
    )
  }

  // ── Step: loading ─────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-[54px] flex items-center px-5">
          <button
            onClick={() => { setPolling(false); setStep("phone") }}
            className="w-8 h-8 flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
          >
            ‹
          </button>
        </div>

        <div className="flex-1 flex flex-col px-5 pt-4">
          <h1 className="text-[26px] font-bold text-[#0f0f10] leading-[1.3]">인증 확인 중 ...</h1>
          <p className="mt-2 text-[15px] text-[#999]">잠시만 기다려주세요.</p>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[120px] h-[120px]">
              <svg className="absolute inset-0 animate-spin" viewBox="0 0 120 120" fill="none">
                <circle cx="60" cy="60" r="54" stroke="#e9e9e9" strokeWidth="8"/>
                <path d="M60 6 A54 54 0 0 1 114 60" stroke="#aecbff" strokeWidth="8" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#aecbff] rounded-[12px] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
                    <path d="M9 12l2 2 4-4" stroke="#aecbff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: password ────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-[54px] flex items-center px-5" />

      <div className="flex-1 px-5 pt-4 flex flex-col gap-7 pb-4 overflow-y-auto">
        <h1 className="text-[26px] font-bold text-[#0f0f10] leading-[1.3]">
          인증이 완료되었어요.<br />비밀번호를 설정해주세요.
        </h1>

        <div className="flex flex-col gap-5">
          {/* 아이디 (readonly) */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#0f0f10]">아이디</label>
            <div className="h-[52px] bg-[#f7f7f8] rounded-[8px] px-4 flex items-center justify-between">
              <span className="text-[15px] text-[#767676]">{phone}</span>
              <div className="w-6 h-6 bg-[#0073ff] rounded-full flex items-center justify-center">
                <CheckIcon />
              </div>
            </div>
            <p className="text-[12px] text-[#767676]">회원님의 휴대폰 번호가 계정이에요.</p>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#0f0f10]">비밀번호</label>
              <span className="text-[12px] text-[#0073ff]">필수</span>
            </div>
            <div className={`h-[52px] border rounded-[8px] px-4 flex items-center justify-between bg-white ${
              pwError ? "border-[#ff3b30]" : pwTouched && pwValid ? "border-[#0073ff]" : "border-[#d8d8d8]"
            }`}>
              <input
                type={showPw ? "text" : "password"}
                placeholder="영문, 숫자 포함 8~12자 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#bbb] outline-none bg-transparent"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-[#bbb]">
                <EyeIcon visible={showPw} />
              </button>
            </div>
            {pwError && (
              <p className="text-[12px] text-[#ff3b30]">{pwError}</p>
            )}
            {pwTouched && pwValid && (
              <p className="text-[12px] text-[#0073ff]">사용 가능한 비밀번호예요.</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-[6px]">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#0f0f10]">비밀번호 확인</label>
              <span className="text-[12px] text-[#0073ff]">필수</span>
            </div>
            <div className={`h-[52px] border rounded-[8px] px-4 flex items-center justify-between bg-white ${
              pwConfirmTouched && !pwMatch ? "border-[#ff3b30]" : pwMatch ? "border-[#0073ff]" : "border-[#d8d8d8]"
            }`}>
              <input
                type={showPwConfirm ? "text" : "password"}
                placeholder="영문+숫자 조합으로 8~12자 입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="flex-1 text-[15px] text-[#0f0f10] placeholder:text-[#bbb] outline-none bg-transparent"
              />
              <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="ml-2 text-[#bbb]">
                <EyeIcon visible={showPwConfirm} />
              </button>
            </div>
            {pwConfirmTouched && (
              <p className={`text-[12px] ${pwMatch ? "text-[#0073ff]" : "text-[#ff3b30]"}`}>
                {pwMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-3">
        <button
          onClick={() => canFinish && setShowTerms(true)}
          disabled={!canFinish}
          className={`w-full h-[52px] rounded-[8px] text-[16px] font-semibold transition-colors ${
            canFinish ? "bg-[#0f0f10] text-white active:opacity-80" : "bg-[#f1f1f1] text-[#0f0f10]"
          }`}
        >
          {submitting ? "처리 중..." : "완료"}
        </button>
      </div>

      {/* 이용약관 Bottom Sheet */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* dim */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowTerms(false)}
          />
          <div className="relative bg-white rounded-t-[20px] px-5 pt-6 pb-8 flex flex-col gap-5">
            <h2 className="text-[18px] font-semibold text-[#0f0f10]">
              마주를 이용하려면 동의가 필요해요.
            </h2>

            <div className="flex flex-col gap-0">
              {/* 개별 항목 먼저 */}
              {TERMS.map((term) => (
                <button
                  key={term.key}
                  type="button"
                  onClick={() => toggleTerm(term.key)}
                  className="flex items-center gap-3 py-[14px]"
                >
                  <Checkbox checked={agreed[term.key]} onChange={() => toggleTerm(term.key)} />
                  <span className="text-[15px] text-[#0f0f10] flex-1 text-left">
                    {term.label}{" "}
                    {term.required
                      ? <span className="text-[#0073ff] text-[13px]">필수</span>
                      : null
                    }
                  </span>
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                    <path d="M1 1l5 5-5 5" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}

              {/* 전체 동의 — 항목 아래 */}
              <div className="mt-3 bg-[#f7f7f8] rounded-[10px] px-4">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-3 py-[16px] w-full"
                >
                  <Checkbox checked={allChecked} onChange={toggleAll} />
                  <span className="text-[16px] font-semibold text-[#0f0f10]">전체 동의</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleAgreeAndFinish}
              disabled={!allRequired}
              className={`w-full h-[52px] rounded-[8px] text-[16px] font-semibold transition-colors ${
                allRequired ? "bg-[#0f0f10] text-white active:opacity-80" : "bg-[#f1f1f1] text-[#0f0f10]"
              }`}
            >
              동의
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
