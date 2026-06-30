"use client"

import { useEffect, useState } from "react"
import {
  bridgeBack,
  bridgeNavigate,
  bridgeRequestContacts,
  onContactsPermissionDenied,
  onContactsReceived,
} from "@/lib/bridge"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import CtaButton from "@/components/ui/cta-button"

type Phase = "intro" | "loading" | "done"

export default function BlockingPage() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [blockedCount, setBlockedCount] = useState(0)
  const [showPermModal, setShowPermModal] = useState(false)

  useEffect(() => {
    onContactsReceived(async (phones) => {
      const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
      try {
        const res = await fetch("/api/blocking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, contactPhones: phones }),
        })
        const data = await res.json()
        setBlockedCount(data.blockedCount ?? phones.length)
      } catch {
        setBlockedCount(phones.length)
      }
      setTimeout(() => setPhase("done"), 500)
    })

    onContactsPermissionDenied(() => {
      setPhase("intro")
      setShowPermModal(true)
    })
  }, [])

  function handleBlock() {
    setPhase("loading")
    bridgeRequestContacts()
    // Fallback for browser (no native): finish after 2 s with 0 contacts
    setTimeout(() => {
      if (typeof window !== "undefined" && !(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView) {
        setPhase("done")
      }
    }, 2000)
  }

  if (phase === "done") {
    return (
      <Screen>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-[56px] h-[56px] rounded-full bg-[#b6d0ff] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5L9.5 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col gap-2 items-start px-5 w-full text-center">
            <p className="font-bold text-[24px] leading-[1.4] tracking-[-0.48px] text-[#1f1f1f] w-full">
              지인 {blockedCount}명을 차단했어요.
            </p>
            <p className="font-normal text-[15px] leading-normal tracking-[-0.3px] text-[#777] w-full">
              차단한 지인과는 서로 프로필이 노출되지 않아요.
            </p>
          </div>
        </div>

        <PageFooter className="flex flex-col gap-4">
          <p className="text-[12px] leading-[1.4] text-[#777] text-center w-full">
            언제든 지인을 추가로 차단하거나, 차단을 해제할 수 있어요.
          </p>
          <CtaButton onClick={() => bridgeNavigate("ProfileSetup")}>다음</CtaButton>
        </PageFooter>
      </Screen>
    )
  }

  return (
    <Screen className="relative">
      <div className="h-[52px] flex items-center px-5">
        <button
          onClick={() => bridgeBack()}
          className="flex items-center justify-center w-6 h-6"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#1f1f1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="ml-3 text-[18px] font-semibold leading-[1.4] tracking-[-0.36px] text-[#1f1f1f]">
          지인 차단하기
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-5 pt-5 scroll-area overflow-y-auto">
        <p className="font-bold text-[24px] leading-[1.4] tracking-[-0.48px] text-[#1f1f1f] whitespace-pre-wrap">
          {"프로필을 만들기 전에, \n연락처에 있는 지인을 \n먼저 차단할까요?"}
        </p>
        <p className="font-normal text-[15px] leading-normal tracking-[-0.3px] text-[#777] whitespace-pre-wrap">
          {"연락처를 기반으로 지인을 차단할 수 있어요. \n차단한 상대에게는 프로필이 노출되지 않아요."}
        </p>
      </div>

      <PageFooter>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => bridgeNavigate("ProfileSetup")}
            className="shrink-0 h-[48px] rounded-[4px] text-[16px] font-semibold leading-[1.4] tracking-[-0.32px] text-[#1f1f1f] bg-[#f4f4f5] active:opacity-80 px-7"
          >
            다음에
          </button>
          <CtaButton onClick={handleBlock} className="flex-1">지인 차단하기</CtaButton>
        </div>
      </PageFooter>

      {/* Loading overlay */}
      {phase === "loading" && (
        <div className="absolute inset-0 bg-black/61 flex items-center justify-center z-20">
          <div className="relative w-[148px] h-[148px] flex items-center justify-center">
            {/* Spinning ring */}
            <svg
              className="absolute inset-0 animate-spin"
              width="148"
              height="148"
              viewBox="0 0 148 148"
              fill="none"
            >
              <circle cx="74" cy="74" r="68" stroke="white" strokeWidth="6" strokeOpacity="0.25"/>
              <path
                d="M74 6 A68 68 0 0 1 142 74"
                stroke="#b6d0ff"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            {/* Logo */}
            <div className="w-[72px] h-[72px] flex items-center justify-center">
              <svg width="72" height="72" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50.4991 39.8612C52.4522 39.6533 55.0759 40.2029 56.8541 41.0154C64.1423 44.3454 67.2119 52.9574 67.9239 60.4069C68.2466 63.7831 68.1515 67.3388 67.9792 70.71L67.7351 74.8568C67.5845 77.2543 67.284 80.2075 68.0879 82.5207C68.8433 84.6947 71.1063 84.3342 71.4908 82.0745C72.0152 78.9899 71.5624 75.9278 71.4048 72.8259C71.3079 70.7444 71.2453 68.6615 71.2173 66.578C71.192 64.7228 71.172 63.0778 71.2825 61.222C71.4586 57.6976 72.1758 54.2213 73.4082 50.9148C74.9834 46.7615 77.9444 42.7834 82.0874 40.9375C85.6047 39.3424 89.6177 39.2361 93.2149 40.6427C97.6866 42.3705 100.623 46.1148 102.487 50.4028C106.15 58.8278 105.936 68.2025 105.202 77.1709C104.907 81.0126 104.229 84.8537 103.358 88.6141C102.441 92.5732 101.333 96.3348 99.8633 100.111L86.3119 100.181L81.5819 100.192C80.9322 100.191 80.0091 100.233 79.3901 100.184C79.994 98.5813 81.1442 96.5054 81.7595 95.0508C82.8039 92.5821 83.9399 90.1235 85.0331 87.6764C86.4608 84.5778 87.5559 81.4516 88.8555 78.2972C91.0046 73.0668 93.4422 66.6191 93.519 60.9279C93.5473 58.8097 92.687 55.7549 91.1147 54.3087C89.8632 53.1572 88.8714 52.7211 87.1764 52.7362C80.8403 53.324 80.7287 62.737 80.7618 67.4536C80.7693 68.9698 80.7949 70.486 80.8383 72.0014C81.0012 79.0376 81.4657 86.9964 78.254 93.4865C77.0625 95.8937 75.1309 98.2291 72.4894 99.0544C67.994 100.459 64.0177 98.1638 61.8365 94.2385C58.7054 88.7446 58.5106 82.3026 58.4783 76.1404L58.4847 68.3514C58.4717 65.0008 58.4578 61.4931 57.441 58.2761C56.8275 56.3351 55.9555 54.3946 54.0545 53.4274C52.9309 52.8278 51.5859 52.7641 50.3752 53.162C46.9405 54.2909 45.5634 58.8751 45.7231 62.1328C45.8955 65.651 47.0045 69.2381 48.1781 72.5377C49.9829 77.6112 52.3037 82.5308 54.5685 87.4114C55.7876 90.0762 56.9887 92.7492 58.1716 95.4302L59.544 98.5282C59.7819 99.0613 60.1373 99.7398 60.3049 100.287C54.3351 100.393 48.3505 100.33 42.3794 100.398C41.5283 100.408 40.6702 100.414 39.8193 100.405C38.844 98.0456 38.2568 95.9883 37.4642 93.5335C35.5896 87.7273 34.3846 81.5737 33.9313 75.501C33.3575 67.6795 33.4214 59.8077 36.1259 52.3491C38.5276 45.7252 43.0754 40.4245 50.4991 39.8612Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermModal && (
        <div className="absolute inset-0 bg-black/61 flex items-center justify-center z-30 px-8">
          <div className="bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <p className="text-[16px] font-semibold leading-normal tracking-[-0.32px] text-[#1f1f1f] whitespace-pre-wrap">
              {"연락처 접근 권한이 필요해요. \n설정에서 권한을 허용해 주세요."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPermModal(false); bridgeNavigate("ProfileSetup") }}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold leading-[1.4] tracking-[-0.32px] text-[#1f1f1f] active:opacity-80"
              >
                다음에
              </button>
              <button
                onClick={() => {
                  setShowPermModal(false)
                  if (typeof window !== "undefined") {
                    window.open("app-settings:", "_blank")
                  }
                }}
                className="flex-1 h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold leading-[1.4] tracking-[-0.32px] text-[#1f1f1f] active:opacity-80"
              >
                설정으로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
