"use client"

import { useState } from "react"
import Screen from "@/components/ui/screen"
import PageFooter from "@/components/ui/page-footer"
import StepHeader from "./StepHeader"
import type { StepProps } from "../types"

const MAX = 500

export default function StepBio({ data, onChange, onNext, onBack, step }: StepProps) {
  const [showSkipModal, setShowSkipModal] = useState(false)

  function handleComplete() {
    onNext()
  }

  function handleSkipConfirm() {
    setShowSkipModal(false)
    onNext()
  }

  return (
    <Screen className="relative">
      <StepHeader onBack={onBack} step={step} title="프로필 설정" />
      <div className="flex-1 px-5 pt-6 flex flex-col gap-[36px] scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
            자기소개를 작성해주세요.
          </h1>
          <p className="text-[15px] text-[#777] leading-normal tracking-[-0.3px]">
            선택한 태그를 바탕으로 나를 더 자세히 소개해주세요.<br />
            자세히 쓸수록 나와 잘 맞는 사람을 만날 확률이 높아져요.
          </p>
        </div>

        <div className="flex flex-col gap-[48px]">
          {data.bioTags.map(tag => (
            <div key={tag} className="flex flex-col gap-2">
              {/* 피그마: bg-[#e9f1ff] border-[#b6d0ff] rounded-[4px] h-[36px] */}
              <span className="self-start h-[36px] flex items-center px-4 bg-[#e9f1ff] border border-[#b6d0ff] rounded-[4px] text-[13px] font-medium text-[#1f1f1f]">
                {tag}
              </span>
              <div className="relative">
                <textarea
                  placeholder="50자 이상 작성해주세요."
                  value={data.bio[tag] ?? ""}
                  onChange={e => onChange({ bio: { ...data.bio, [tag]: e.target.value.slice(0, MAX) } })}
                  className="w-full min-h-[93px] border border-[#dbdcdf] rounded-[4px] px-4 pt-3 pb-8 text-[15px] text-[#1f1f1f] placeholder:text-[#b7b7b7] outline-none focus:border-[#90b7ff] resize-none tracking-[-0.3px] leading-normal"
                />
                <span className="absolute bottom-3 right-3 text-[12px] font-medium text-[#777]">
                  {(data.bio[tag] ?? "").length}/{MAX}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 피그마: 두 버튼 나란히 — "나중에 작성"(회색) + "완료"(파랑) */}
      <PageFooter>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSkipModal(true)}
            className="flex-1 h-[48px] rounded-[4px] bg-[#f4f4f5] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80"
          >
            나중에 작성
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 h-[48px] rounded-[4px] bg-[#b6d0ff] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80"
          >
            완료
          </button>
        </div>
      </PageFooter>

      {/* 나중에 작성 확인 모달 (151:3242) */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
          <div className="absolute inset-0 bg-black/61" onClick={() => setShowSkipModal(false)} />
          <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-semibold text-[#1f1f1f] leading-normal tracking-[-0.32px]">
                자기소개를 나중에 작성할까요?
              </p>
              <p className="text-[15px] text-[#777] leading-normal tracking-[-0.3px]">
                자기소개를 작성하지 않으면 상대방에게 호감과 쪽지를 보낼 수 없어요
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSkipConfirm}
                className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80"
              >
                나중에 작성
              </button>
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                className="flex-1 h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80"
              >
                지금 작성
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}
