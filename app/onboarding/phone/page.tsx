"use client"

import { useState } from "react"
import { navigateAndReplace } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const PHONE_RE = /^010[0-9]{7,8}$/

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

export default function PhoneInputPage() {
  const [phone, setPhone] = useState("")

  const rawPhone = phone.replace(/\D/g, "")
  const touched = rawPhone.length > 0
  const canSubmit = PHONE_RE.test(rawPhone)
  const showError = touched && !canSubmit

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value.replace(/\D/g, "").slice(0, 11)))
  }

  function handleNext() {
    if (!canSubmit) return
    navigateAndReplace("Verify", { phone: rawPhone })
  }

  return (
    <Screen>
      {/* status bar 영역 */}
      <div className="h-[44px]" />

      {/* 메인 콘텐츠 — Figma: gap-[52px] 후 title+field 섹션 */}
      <div className="flex-1 px-5 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-[48px]" style={{ marginTop: 52 }}>
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            회원가입을 위해{" "}
            <br />
            휴대폰 번호를 입력해 주세요.
          </h1>

          {/* 입력 필드 그룹 */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">
              휴대폰 번호
            </label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="'-' 없이 숫자만 입력"
              value={phone}
              onChange={handleChange}
              className={`w-full h-[48px] rounded-[4px] px-4 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-white transition-colors ${
                showError
                  ? "border border-[#ffb5b5]"
                  : canSubmit
                  ? "border border-[#dbdcdf]"
                  : "border border-[#dbdcdf]"
              }`}
            />
            {showError && (
              <p className="text-[12px] font-medium text-[#ff334b] leading-[1.4]">
                올바른 휴대폰 번호를 입력해주세요.
              </p>
            )}
          </div>
        </div>
      </div>

      <PageFooter>
        <CtaButton disabled={!canSubmit} onClick={handleNext}>다음</CtaButton>
      </PageFooter>
    </Screen>
  )
}
