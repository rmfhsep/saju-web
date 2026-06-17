"use client"

import { useState } from "react"
import { bridgeNavigate } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}

function EyeToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="absolute right-4 top-1/2 -translate-y-1/2">
      {visible ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 2.5l15 15" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8.82 8.82A2.5 2.5 0 0011.18 11.18M6.1 6.1C4.3 7.2 2.9 8.9 2 10c1.7 2.4 4.6 5 8 5 1.5 0 2.9-.5 4.1-1.3M9.5 5.06C9.67 5.02 9.83 5 10 5c3.4 0 6.3 2.6 8 5-.5.8-1.2 1.7-2 2.4" stroke="#9e9e9e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 10C3.7 7 6.6 4.5 10 4.5S16.3 7 18 10c-1.7 3-4.6 5.5-8 5.5S3.7 13 2 10z" stroke="#9e9e9e" strokeWidth="1.5"/>
          <circle cx="10" cy="10" r="2.5" stroke="#9e9e9e" strokeWidth="1.5"/>
        </svg>
      )}
    </button>
  )
}

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [pwError, setPwError] = useState("")

  const rawPhone = phone.replace(/\D/g, "")
  const canSubmit = rawPhone.length >= 10 && password.length >= 8

  async function handleLogin() {
    if (!canSubmit || loading) return
    setLoading(true)
    setPhoneError("")
    setPwError("")

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawPhone, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === "USER_NOT_FOUND") setPhoneError("등록되지 않은 휴대폰 번호예요.")
        else setPwError("비밀번호가 일치하지 않아요.")
        return
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("user_phone", rawPhone)
      }

      if (data.profileComplete) bridgeNavigate("Home")
      else if (data.birthDate) bridgeNavigate("Blocking")
      else bridgeNavigate("BirthInfo")
    } catch {
      setPwError("네트워크 오류가 발생했어요. 다시 시도해 주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <div className="h-[44px]" />

      <div className="flex-1 px-5 pt-12 flex flex-col gap-[52px] scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] tracking-[-0.48px]">로그인이 필요해요.</h1>
          <p className="text-[14px] text-[#777] tracking-[-0.3px] leading-normal">
            새로운 프로필을 확인하려면 다시 로그인 해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-[28px]">
          {/* 계정 */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#1f1f1f]">계정</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="휴대폰 번호를 입력해주세요."
              value={phone}
              onChange={e => { setPhone(formatPhone(e.target.value)); setPhoneError("") }}
              className={`h-[48px] border rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-white transition-colors ${
                phoneError ? "border-[#ff3b30] focus:border-[#ff3b30]" : "border-[#dbdcdf] focus:border-[#90b7ff]"
              }`}
            />
            {phoneError && <p className="text-[12px] text-[#ff3b30] tracking-[-0.24px]">{phoneError}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#1f1f1f]">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="영문, 숫자 포함 8~12자"
                value={password}
                onChange={e => { setPassword(e.target.value.slice(0, 12)); setPwError("") }}
                className={`w-full h-[48px] border rounded-[4px] px-4 pr-12 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-white transition-colors ${
                  pwError ? "border-[#ff3b30] focus:border-[#ff3b30]" : "border-[#dbdcdf] focus:border-[#90b7ff]"
                }`}
              />
              {password.length > 0 && <EyeToggle visible={showPw} onClick={() => setShowPw(v => !v)} />}
            </div>
            {pwError && <p className="text-[12px] text-[#ff3b30] tracking-[-0.24px]">{pwError}</p>}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => bridgeNavigate("Verify")}
              className="text-[14px] text-[#777] underline underline-offset-[3px]"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>
      </div>

      <PageFooter>
        <CtaButton disabled={!canSubmit} loading={loading} onClick={handleLogin}>
          {loading ? "로그인 중..." : "로그인"}
        </CtaButton>
      </PageFooter>
    </Screen>
  )
}
