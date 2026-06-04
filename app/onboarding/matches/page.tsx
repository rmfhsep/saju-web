"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"

// Figma assets — expires 7 days. Replace with /public/ images.
const PROFILES = [
  { name: "통레조", age: "27살", img: "https://www.figma.com/api/mcp/asset/355f79ab-025b-4996-9113-e5f1d15044c6" },
  { name: "미미미",  age: "27살", img: "https://www.figma.com/api/mcp/asset/5e8344ab-58a9-4fe0-b0f3-9953611b2479" },
]

const TAGS = ["천천히 가까워지는", "감정표현 풍부", "깔끔한 스타일 선호"]

function MatchesContent() {
  const params = useSearchParams()
  const name = params.get("name") ?? "정훈"
  const givenName = name.length >= 2 ? name.slice(-2) : name

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white h-[54px] flex items-center px-4">
        <button
          onClick={() => bridgeBack()}
          className="w-[30px] h-[30px] flex items-center justify-center text-[28px] text-[#0f0f10] leading-none"
        >
          ‹
        </button>
        <h2 className="flex-1 text-center text-[18px] font-semibold text-[#0f0f10]">연애운 리포트</h2>
        <div className="w-[30px]" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3 pb-4">
        <div className="px-4 flex flex-col gap-3">
          <p className="text-[15px] text-[#0f0f10]">✓ 분석 완료</p>
          <h1 className="text-2xl font-bold text-[#0f0f10] leading-[1.3]">
            {givenName}님의 연애 성향을 분석해{"\n"}프로필을 준비했어요.
          </h1>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
          {PROFILES.map((p) => (
            <div
              key={p.name}
              className="relative shrink-0 w-[280px] h-[380px] rounded-[8px] overflow-hidden"
            >
              <img
                src={p.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "blur(10px)", transform: "scale(1.1)" }}
              />
              <div className="absolute inset-0 bg-[rgba(34,34,34,0.55)]" />
              <div className="absolute bottom-5 left-4 right-4 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <p className="text-[20px] font-bold text-white">
                    {p.name} / {p.age}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-[3px] bg-[#aecbff] rounded-[4px] text-[12px] font-medium text-[#0f0f10]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => bridgeNavigate("ProfileSetup")}
                  className="w-full h-9 bg-[#0f0f10] rounded-[54px] text-[14px] font-medium text-white active:opacity-80"
                >
                  내 프로필 완성하고 열어보기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User info & accordions */}
        <div className="px-4 flex flex-col gap-3">
          <div className="bg-[#eaf2ff] rounded-[4px] p-4 flex flex-col gap-1">
            <p className="text-[14px] font-semibold text-[#0f0f10]">{name}</p>
            <p className="text-[14px] font-medium text-[#0f0f10]">양력 1994년 NN월 NN일 (출생시 모름)</p>
          </div>
          <button className="flex items-center justify-between py-4 border-b border-[#f0f0f0]">
            <span className="text-[16px] font-semibold text-[#0f0f10]">나의 연애운</span>
            <span className="text-[13px] text-[#0f0f10]">∨</span>
          </button>
          <button className="flex items-center justify-between py-4 border-b border-[#f0f0f0]">
            <span className="text-[16px] font-semibold text-[#0f0f10]">나의 명식</span>
            <span className="text-[13px] text-[#0f0f10]">∨</span>
          </button>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-white px-4 pb-8 pt-3">
        <button
          onClick={() => bridgeNavigate("ProfileSetup")}
          className="w-full h-[48px] bg-[#aecbff] rounded-[4px] text-[16px] font-semibold text-[#0f0f10] active:opacity-80"
        >
          내 프로필 만들기
        </button>
      </div>
    </div>
  )
}

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesContent />
    </Suspense>
  )
}
