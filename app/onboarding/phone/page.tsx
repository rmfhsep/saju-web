"use client"

import { useState } from "react"
import { navigateAndReplace } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const PHONE_RE = /^01[0-9]{8,9}$/

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value.replace(/\D/g, "").slice(0, 11)))
  }

  function handleNext() {
    if (!canSubmit) return
    navigateAndReplace("Verify", { phone: rawPhone })
  }

  return (
    <Screen>
      <div className="h-[44px]" />

      <div className="flex-1 px-5 pt-[52px] flex flex-col gap-[48px] scroll-area overflow-y-auto pb-4">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          회원가입을 위해<br />휴대폰 번호를 입력해 주세요.
        </h1>
      </div>

      <PageFooter>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.14px]">휴대폰 번호</label>
            <div
              className={`h-[48px] rounded-[4px] px-4 flex items-center bg-white ${
                touched && !canSubmit ? "border border-[#ff3b30]"
                : canSubmit ? "border-[1.5px] border-[#90b7ff]"
                : "border border-[#dbdcdf]"
              }`}
            >
              <input
                type="tel"
                inputMode="numeric"
                placeholder="010-0000-0000"
                value={phone}
                onChange={handleChange}
                className="flex-1 text-[16px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none bg-transparent leading-normal tracking-[-0.32px]"
              />
            </div>
            {touched && !canSubmit && (
              <p className="text-[12px] text-[#ff3b30] leading-[1.4]">올바른 휴대폰 번호를 입력해주세요.</p>
            )}
          </div>
          <CtaButton disabled={!canSubmit} onClick={handleNext}>다음</CtaButton>
        </div>
      </PageFooter>
    </Screen>
  )
}
