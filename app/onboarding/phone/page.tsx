"use client"

import { useRef, useState } from "react"
import { navigateAndReplace, bridgeNavigate, bridgeSyncAuthToken } from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

const PHONE_RE = /^010[0-9]{7,8}$/
const LONG_PRESS_MS = 3000
// 3초간 손가락을 완벽히 고정하는 건 불가능해서, 이 픽셀 이내의 떨림은 누르는 중으로 본다
// (app/my/edit/page.tsx의 사진 순서변경 롱프레스와 동일한 값).
const MOVE_CANCEL_PX = 14

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`
}

/** 앱스토어 심사관용 숨김 로그인 — 타이틀을 3초 꾹 누르면 뜨는 모달. */
function ReviewLoginModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!username || !password || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/review-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError("아이디 또는 비밀번호가 일치하지 않아요.")
        return
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token)
        bridgeSyncAuthToken(data.token)
        localStorage.setItem("user_phone", data.phone)
        localStorage.removeItem("did_logout")
      }

      if (data.profileComplete) {
        if (data.filterComplete) bridgeNavigate("Home")
        else bridgeNavigate("Filter")
      } else if (data.birthDate) bridgeNavigate("Blocking")
      else bridgeNavigate("BirthInfo")
    } catch {
      setError("네트워크 오류가 발생했어요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
      <div className="w-full max-w-[320px] bg-white rounded-[8px] p-5 flex flex-col gap-4">
        <p className="text-[16px] font-semibold text-[#1f1f1f]">심사용 로그인</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="아이디"
            autoCapitalize="none"
            autoCorrect="off"
            value={username}
            onChange={e => { setUsername(e.target.value); setError("") }}
            className="w-full h-[44px] rounded-[4px] border border-[#dbdcdf] px-3 text-[15px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff]"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => { setPassword(e.target.value); setError("") }}
            className="w-full h-[44px] rounded-[4px] border border-[#dbdcdf] px-3 text-[15px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff]"
          />
          {error && <p className="text-[12px] text-[#ff3b30]">{error}</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-[44px] rounded-[4px] bg-[#f4f4f5] text-[#1f1f1f] text-[15px] font-medium"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!username || !password || loading}
            className="flex-1 h-[44px] rounded-[4px] bg-[#1a73e8] text-white text-[15px] font-medium disabled:opacity-40"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PhoneInputPage() {
  const [phone, setPhone] = useState("")
  const [showReviewLogin, setShowReviewLogin] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressStart = useRef<{ x: number; y: number } | null>(null)

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

  function startLongPress(x: number, y: number) {
    pressStart.current = { x, y }
    longPressTimer.current = setTimeout(() => setShowReviewLogin(true), LONG_PRESS_MS)
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    pressStart.current = null
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0]
    if (!touch || !pressStart.current) return
    const dx = Math.abs(touch.clientX - pressStart.current.x)
    const dy = Math.abs(touch.clientY - pressStart.current.y)
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) cancelLongPress()
  }

  return (
    <Screen>
      {/* status bar 영역 */}
      <div className="h-[44px]" />

      {/* 메인 콘텐츠 — Figma: gap-[52px] 후 title+field 섹션 */}
      <div className="flex-1 px-5 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-[48px]" style={{ marginTop: 52 }}>
          <h1
            className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px] select-none"
            onTouchStart={e => {
              const t = e.touches[0]
              if (t) startLongPress(t.clientX, t.clientY)
            }}
            onTouchEnd={cancelLongPress}
            onTouchMove={handleTouchMove}
            onMouseDown={e => startLongPress(e.clientX, e.clientY)}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
          >
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
                  : "border border-[#dbdcdf] focus:border-[#90b7ff]"
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

      {showReviewLogin && <ReviewLoginModal onClose={() => setShowReviewLogin(false)} />}
    </Screen>
  )
}
