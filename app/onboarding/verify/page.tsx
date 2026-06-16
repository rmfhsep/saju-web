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
  { key: "service", label: "이용 약관", suffix: " 동의", required: true },
  { key: "privacy", label: "개인정보 수집 및 이용", suffix: " 동의", required: true },
  { key: "sensitive", label: "민감정보 수집 및 이용", suffix: " 동의", required: true },
  { key: "marketing", label: "마케팅 정보 수신", suffix: " 동의", required: false },
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

// Square checkbox matching Figma: rounded-[4px], #e1e2e4 border off, #b6d0ff fill on
function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-[#b6d0ff]" : "border border-[#e1e2e4]"
      }`}
    >
      {checked && (
        <svg width="7.5" height="5" viewBox="0 0 7.5 5" fill="none">
          <path d="M1 2.5L3 4.5L6.5 1" stroke="#1f1f1f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}

// Solid blue circle check icon for the account field
function CircleCheck() {
  return (
    <div className="w-[24px] h-[24px] rounded-full bg-[#1a75ff] flex items-center justify-center shrink-0">
      <svg width="7.5" height="5" viewBox="0 0 7.5 5" fill="none">
        <path d="M1 2.5L3 4.5L6.5 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
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
      if (res.ok) {
        const data = await res.json()
        if (data.token) localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_phone", rawPhone)
        if (data.isNew === false) {
          bridgeNavigate("BirthInfo")
        } else {
          bridgeNavigate("BirthInfo")
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Step: phone ──────────────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* status bar spacer */}
        <div className="h-[44px]" />

        <div className="flex-1 px-5 pt-[52px] flex flex-col gap-[48px] overflow-y-auto pb-4">
          {/* title + instructions */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
              휴대폰 번호 인증으로<br />간편하게 가입해요.
            </h1>
            <ol className="list-decimal flex flex-col gap-0 text-[14px] text-[#777] leading-normal tracking-[-0.14px] pl-[21px]">
              <li>하단 &apos;인증 코드 보내기&apos; 버튼을 눌러주세요.</li>
              <li>이동한 메시지 작성 창에서,<br />인증 코드 메시지가 자동으로 입력되어 있어요.</li>
              <li>인증 메시지를 수정 없이 전송 후,<br />화면으로 다시 돌아와 다음 절차를 진행해주세요.</li>
            </ol>
          </div>

          {/* SMS preview illustration */}
          <div className="flex flex-col gap-1">
            <div className="relative h-[248px] overflow-hidden">
              {/* Phone message bubble background */}
              <div className="absolute left-[41px] top-[33px]">
                {/* Rounded top of phone */}
                <div
                  className="absolute left-[62px] top-0 w-[201px] h-[163px] bg-white rounded-tl-[28px] rounded-tr-[28px]"
                  style={{ border: "8px solid #e1e3e6", borderBottom: "none" }}
                />
                <p className="absolute left-[133px] top-[17px] text-[11px] font-bold text-[#1b1c1e] whitespace-nowrap">
                  새로운 메시지
                </p>
                <p className="absolute left-[78px] top-[49px] text-[9px] whitespace-nowrap">
                  <span className="text-[#878a93]">받는 사람 : </span>
                  <span className="text-[#1a75ff]">{OCTOMO_DISPLAY}</span>
                </p>
                {/* dividers */}
                <div className="absolute left-[70px] top-[41px] w-[185px] h-px bg-[#e1e3e6]" />
                <div className="absolute left-[70px] top-[71px] w-[185px] h-px bg-[#e1e3e6]" />

                {/* SMS card */}
                <div className="absolute left-[41px] top-[95px] w-[242px] h-[79px] bg-white rounded-[6px] border border-[#dfdfdf] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.08)] flex items-center justify-between px-3">
                  <div>
                    <p className="text-[11px] text-[#5a5c63]">[마주] 인증문자 보내기</p>
                    <p className="text-[20px] font-semibold text-[#111] tracking-widest mt-0.5">{code}</p>
                  </div>
                  {/* Green send button */}
                  <div className="relative w-[50px] h-[35px] flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#e2ffdf] rounded-[50px]" />
                    <div className="absolute inset-[8%_8%] bg-[#b7ffb1] rounded-[50px]" />
                    <div className="absolute inset-[16%_16%] bg-[#41de35] rounded-[50px]" />
                    <svg className="relative z-10" width="10" height="13" viewBox="0 0 10 13" fill="none">
                      <path d="M5 12V1M5 1L1 5M5 1L9 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Tooltip bubble */}
                <div className="absolute left-[157px] top-[62px] w-[146px]">
                  <div className="bg-[#1a75ff] rounded-[4px] px-3 py-2 flex items-center justify-center min-h-[56px]">
                    <p className="text-[14px] text-white leading-[1.429] text-center">
                      입력 된 문자를 보내면<br /><span className="font-bold">본인인증</span>이 돼요.
                    </p>
                  </div>
                  {/* Arrow pointing down-left */}
                  <div className="flex justify-center">
                    <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path d="M8 8L0 0h16L8 8z" fill="#1a75ff"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[12px] text-[#777] leading-[1.4]">
              ※ 이용중인 통신 요금제에 따라 문자 메시지 발송 비용이 발생할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="px-5 pt-4 pb-8 keyboard-safe-bottom">
          <button
            onClick={handleSendSms}
            disabled={!canSend}
            className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] transition-colors ${
              canSend ? "bg-[#e9f1ff] text-[#1a75ff] active:opacity-80" : "bg-[#e8e8e8] text-white"
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
      <div className="flex flex-col min-h-screen bg-white">
        {/* status bar spacer */}
        <div className="h-[44px]" />

        <div className="flex flex-col px-5 pt-[52px] gap-3">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">인증 확인 중 ...</h1>
          <p className="text-[15px] text-[#777] leading-normal tracking-[-0.3px]">잠시만 기다려주세요.</p>
        </div>

        {/* Centered spinner */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-[148px] h-[148px] flex items-center justify-center">
            {/* Spinner ring */}
            <svg className="absolute inset-0 animate-spin w-full h-full" viewBox="0 0 148 148" fill="none">
              <circle cx="74" cy="74" r="68" stroke="#efefef" strokeWidth="8"/>
              <path
                d="M74 6 A68 68 0 0 1 142 74"
                stroke="#90b7ff"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            {/* Shield check icon */}
            <div className="relative z-10 w-[56px] h-[56px] rounded-[12px] bg-[#b6d0ff] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3L5 7v7c0 6.1 4.1 11.8 9.3 13.4C19.9 25.8 24 20.1 24 14V7L14 3z" fill="white"/>
                <path d="M10 14l3 3 5-5" stroke="#b6d0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: password ────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* status bar spacer */}
      <div className="h-[44px]" />

      <div className="flex-1 px-5 pt-[52px] flex flex-col gap-[48px] pb-4 overflow-y-auto">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          인증이 완료되었어요.<br />비밀번호를 설정해주세요.
        </h1>

        <div className="flex flex-col gap-[28px]">
          {/* 계정 (readonly) */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">계정</label>
            <div className="h-[48px] bg-[#f5f5f5] border border-[#dbdcdf] rounded-[4px] px-4 flex items-center justify-between gap-3">
              <span className="text-[16px] text-[#777] leading-normal tracking-[-0.32px]">{phone}</span>
              <CircleCheck />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">비밀번호</label>
            </div>
            <div
              className={`h-[48px] rounded-[4px] px-4 flex items-center justify-between bg-white ${
                pwError
                  ? "border border-[#ff3b30]"
                  : pwTouched && pwValid
                  ? "border-[1.5px] border-[#90b7ff]"
                  : "border border-[#dbdcdf]"
              }`}
              style={pwTouched && pwValid ? { borderWidth: "1.5px" } : {}}
            >
              <input
                type={showPw ? "text" : "password"}
                placeholder="영문, 숫자 포함 8~12자 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-transparent leading-normal tracking-[-0.32px]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="ml-2 text-[#b7b7b7]">
                <EyeIcon visible={showPw} />
              </button>
            </div>
            {pwError && (
              <p className="text-[12px] text-[#ff3b30] leading-[1.4]">{pwError}</p>
            )}
            {pwTouched && pwValid && (
              <p className="text-[12px] text-[#1a75ff] leading-[1.4]">사용 가능한 비밀번호예요.</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <label className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">비밀번호 확인</label>
            </div>
            <div
              className={`h-[48px] rounded-[4px] px-4 flex items-center justify-between bg-white ${
                pwConfirmTouched && !pwMatch
                  ? "border border-[#ff3b30]"
                  : pwMatch
                  ? "border-[#90b7ff]"
                  : "border border-[#dbdcdf]"
              }`}
              style={pwMatch ? { border: "1.5px solid #90b7ff" } : {}}
            >
              <input
                type={showPwConfirm ? "text" : "password"}
                placeholder="영문+숫자 조합으로 8~12자 입력"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-transparent leading-normal tracking-[-0.32px]"
              />
              <button type="button" onClick={() => setShowPwConfirm(!showPwConfirm)} className="ml-2 text-[#b7b7b7]">
                <EyeIcon visible={showPwConfirm} />
              </button>
            </div>
            {pwConfirmTouched && (
              <p className={`text-[12px] leading-[1.4] ${pwMatch ? "text-[#1a75ff]" : "text-[#ff3b30]"}`}>
                {pwMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-8 keyboard-safe-bottom">
        <button
          onClick={() => canFinish && setShowTerms(true)}
          disabled={!canFinish}
          className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] transition-colors ${
            canFinish ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80" : "bg-[#e8e8e8] text-white"
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
            className="absolute inset-0 bg-black/61"
            onClick={() => setShowTerms(false)}
          />
          <div className="relative bg-white rounded-t-[28px] pt-8 flex flex-col gap-6 items-center">
            <div className="flex flex-col gap-7 w-[335px]">
              <h2 className="text-[18px] font-semibold text-[#1f1f1f] leading-[1.4] tracking-[-0.36px] text-center w-full">
                마주를 이용하려면 동의가 필요해요.
              </h2>

              <div className="flex flex-col gap-6">
                {/* Individual terms */}
                <div className="flex flex-col gap-5">
                  {TERMS.map((term) => (
                    <button
                      key={term.key}
                      type="button"
                      onClick={() => toggleTerm(term.key)}
                      className="flex items-center gap-2"
                    >
                      <Checkbox checked={agreed[term.key]} onChange={() => toggleTerm(term.key)} />
                      <div className="flex items-center gap-1">
                        <span className="text-[15px] font-medium text-[#1f1f1f] leading-normal tracking-[-0.3px]">
                          <span className="underline underline-offset-auto">{term.label}</span>
                          {term.suffix}
                        </span>
                        {term.required && (
                          <span className="text-[12px] text-[#1a75ff] leading-[1.4]">필수</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 전체 동의 */}
                <div
                  className={`rounded-[4px] p-4 flex items-center gap-2 ${allChecked ? "bg-[#e9f1ff]" : "bg-[#f7f7f8]"}`}
                >
                  <Checkbox checked={allChecked} onChange={toggleAll} />
                  <span className="text-[16px] font-medium text-[#1f1f1f] leading-normal tracking-[-0.32px]">전체 동의</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="w-full px-5 pb-8 pt-0 flex flex-col">
              <button
                onClick={handleAgreeAndFinish}
                disabled={!allRequired}
                className={`w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] transition-colors ${
                  allRequired ? "bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80" : "bg-[#e8e8e8] text-white"
                }`}
              >
                동의
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
