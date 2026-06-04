"use client"

import { useEffect, useRef, useState } from "react"
import { bridgeBack, bridgeNavigate, bridgeOpenSms } from "@/lib/bridge"

type Step = "phone" | "pending" | "done"

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

export default function VerifyPage() {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [code] = useState(generateCode)
  const [elapsed, setElapsed] = useState(0)
  const [polling, setPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const rawPhone = phone.replace(/\D/g, "")
  const canProceed = rawPhone.length === 11

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11)
    setPhone(formatPhone(raw))
  }

  function handleSendSms() {
    if (!canProceed) return
    // 문자 앱 열기 (수신번호 + 내용 자동 세팅)
    bridgeOpenSms(OCTOMO_NUMBER, code)
    // 문자 앱이 열리는 동시에 폴링 시작
    setStep("pending")
    setPolling(true)
  }

  // Octomo API 폴링 (3초마다)
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
          setStep("done")
          setTimeout(() => bridgeNavigate("Landing"), 1200)
        }
      } catch {
        // 네트워크 오류 — 계속 폴링
      }
    }

    check()
    intervalRef.current = setInterval(check, 3000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [polling])

  // 경과 시간 타이머
  useEffect(() => {
    if (step !== "pending") return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [step])

  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="h-[54px] flex items-center px-4">
        {step === "phone" && (
          <button
            onClick={() => bridgeBack()}
            className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
          >
            ‹
          </button>
        )}
        {step === "pending" && (
          <button
            onClick={() => { setStep("phone"); setPolling(false); setElapsed(0) }}
            className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
          >
            ‹
          </button>
        )}
      </div>

      {/* Step: 번호 입력 */}
      {step === "phone" && (
        <>
          <div className="flex-1 flex flex-col px-4 pt-6 gap-12">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold text-[#0f0f10] leading-[1.3]">
                본인 확인을 위해<br />휴대폰 번호를 입력해주세요.
              </h1>
              <p className="text-[15px] text-[#999] leading-normal">
                인증 버튼을 누르면 문자 앱이 바로 열려요.
              </p>
            </div>

            <div className="flex flex-col gap-[6px]">
              <label className="text-[14px] font-semibold text-[#0f0f10]">휴대폰 번호</label>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="010-0000-0000"
                value={phone}
                onChange={handlePhoneChange}
                className="h-[48px] border border-[#d8d8d8] rounded-[8px] px-4 text-[15px] text-[#0f0f10] placeholder:text-[#999] outline-none focus:border-[#0f0f10] bg-white tracking-wider"
              />
            </div>
          </div>

          <div className="px-4 pb-8 pt-4">
            <button
              onClick={handleSendSms}
              disabled={!canProceed}
              className={`w-full h-[48px] bg-[#aecbff] rounded-[4px] text-[16px] font-semibold text-[#0f0f10] transition-opacity ${
                !canProceed ? "opacity-50" : "active:opacity-80"
              }`}
            >
              인증 문자 보내기
            </button>
          </div>
        </>
      )}

      {/* Step: 문자 전송 대기 */}
      {step === "pending" && (
        <>
          <div className="flex-1 flex flex-col px-4 pt-6 gap-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl font-bold text-[#0f0f10] leading-[1.3]">
                문자 앱에서<br />전송 버튼만 누르면 돼요.
              </h1>
              <p className="text-[15px] text-[#999] leading-normal">
                수신번호와 인증 코드가 자동으로 입력됐어요.
              </p>
            </div>

            {/* 인증 정보 카드 */}
            <div className="bg-[#f7f7f8] rounded-[12px] p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-[13px] text-[#999] font-medium">문자 받는 번호</p>
                <p className="text-[26px] font-bold text-[#0f0f10] tracking-wider">{OCTOMO_DISPLAY}</p>
              </div>
              <div className="h-px bg-[#e9e9e9]" />
              <div className="flex flex-col gap-1">
                <p className="text-[13px] text-[#999] font-medium">인증 코드</p>
                <p className="text-[40px] font-bold text-[#0f0f10] tracking-[0.25em]">{code}</p>
              </div>
            </div>

            {/* 문자 앱 다시 열기 */}
            <button
              onClick={() => bridgeOpenSms(OCTOMO_NUMBER, code)}
              className="flex items-center justify-center gap-2 h-[44px] border border-[#d8d8d8] rounded-[8px] text-[15px] text-[#0f0f10] font-medium active:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C7.73865 15.75 6.55504 15.4076 5.54163 14.8105L2.25 15.75L3.18946 12.4584C2.59242 11.445 2.25 10.2613 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9Z" stroke="#0f0f10" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              문자 앱 다시 열기
            </button>

            {/* 폴링 상태 */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#aecbff] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-[14px] text-[#999]">인증 확인 중... {elapsedStr}</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <span className="text-[13px] text-[#999] mt-0.5">•</span>
                <p className="text-[13px] text-[#999] leading-normal">
                  {phone} 번호로 문자를 전송해야 인증이 완료돼요.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[13px] text-[#999] mt-0.5">•</span>
                <p className="text-[13px] text-[#999] leading-normal">
                  전송 후 수초 내 자동으로 인증이 완료돼요.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step: 인증 완료 */}
      {step === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="w-16 h-16 rounded-full bg-[#eaf2ff] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16l7 7 11-13" stroke="#0f0f10" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-[#0f0f10]">인증 완료!</p>
          <p className="text-[15px] text-[#999]">잠시 후 이동합니다...</p>
        </div>
      )}
    </div>
  )
}
