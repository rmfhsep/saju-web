"use client";

import { useEffect, useState } from "react";
import { useAppRouter } from "@/lib/useAppRouter";
import Screen from "@/components/ui/screen";
import BackButton from "@/components/ui/back-button";
import PageFooter from "@/components/ui/page-footer";
import CtaButton from "@/components/ui/cta-button";

type Level = "HIGH" | "MID" | "LOW";

type DailyFortuneDetail = {
  date: string;
  총운: { score: number; level: Level };
  애정운: { level: Level; text: string };
  새로운인연운: { level: Level; text: string };
  궁합좋은상대: { 유형명: string; 설명: string } | null;
  행운의아이템: string;
  게이지보완문구: string | null;
};

function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
}

// Figma 원형 게이지(node 396:6548 "gage") — 트랙 #F7F7F8 + 진행 아크 #90B7FF, r=74/stroke=12 그대로 재현
function GaugeRing({ score }: { score: number }) {
  const r = 74;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(score, 0), 100);
  const offset = circumference * (1 - clamped / 100);

  return (
    <svg width={160} height={160} viewBox="0 0 160 160" fill="none">
      <circle cx="80" cy="80" r={r} stroke="#F7F7F8" strokeWidth="12" />
      <circle
        cx="80"
        cy="80"
        r={r}
        stroke="#90B7FF"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 80 80)"
      />
    </svg>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white border border-[#e8e8e8] rounded-[4px] p-4 flex flex-col gap-2">
      <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
        {title}
      </p>
      <p className="text-[14px] text-[#1f1f1f] leading-[1.5] tracking-[-0.14px]">
        {text}
      </p>
    </div>
  );
}

export default function TodayFortunePage() {
  const router = useAppRouter();
  const [fortune, setFortune] = useState<DailyFortuneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/daily-fortune/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setFortune(d))
      .catch(() => setFortune(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleShare() {
    if (!fortune) return;
    const text = `[오늘의 운세 · ${formatDate(fortune.date)}]\n총운 ${
      fortune.총운.score
    }점\n${fortune.애정운.text}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "오늘의 운세", text }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareMsg("클립보드에 복사했어요");
    } catch {
      setShareMsg("공유하지 못했어요");
    }
    setTimeout(() => setShareMsg(null), 2000);
  }

  return (
    <Screen>
      <div className="h-[52px] flex items-center gap-3 px-5 py-3.5 shrink-0">
        <BackButton onClick={() => router.back()} />
        <h1 className="flex-1 text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
          오늘의 연애운
        </h1>
      </div>

      {loading ? (
        <div className="flex-1 scroll-area overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] flex flex-col items-center gap-9 pt-7">
          <div className="w-[164px] h-[164px] rounded-full bg-[#f4f4f5] animate-pulse" />
          <div className="w-full flex flex-col gap-3">
            <div className="h-[80px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[80px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[130px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
            <div className="h-[70px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
          </div>
        </div>
      ) : !fortune ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
          <p className="text-[15px] font-semibold text-[#1f1f1f]">
            운세를 불러오지 못했어요
          </p>
          <p className="text-[13px] text-[#777]">잠시 후 다시 시도해주세요.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 scroll-area overflow-y-auto pb-6 flex flex-col items-center pt-7">
            {/* 총운 원형 게이지 */}
            <div className="relative w-[164px] h-[164px] flex items-center justify-center shrink-0">
              <GaugeRing score={fortune.총운.score} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <img
                  src="/icons/luck-clover.png"
                  alt=""
                  className="w-[52px] h-[52px] object-contain"
                />
                <div className="flex items-center gap-0.5 text-[#1f1f1f]">
                  <span className="text-[28px] font-bold tracking-[-0.56px]">
                    {fortune.총운.score}
                  </span>
                  <span className="text-[17px] font-semibold tracking-[-0.34px]">
                    점
                  </span>
                </div>
              </div>
            </div>

            {/* LOW 전용 보완 문구 */}
            {fortune.게이지보완문구 && (
              <p className="mt-4 px-5 text-[14px] text-[#1f1f1f] text-center leading-[1.5] tracking-[-0.14px] whitespace-pre-line">
                {fortune.게이지보완문구}
              </p>
            )}

            <div className="w-full px-5 flex flex-col gap-3 mt-9">
              <InfoCard title="오늘의 애정운" text={fortune.애정운.text} />
              <InfoCard title="새로운 인연운" text={fortune.새로운인연운.text} />

              {fortune.궁합좋은상대 && (
                <div className="bg-[#f7f7f8] rounded-[4px] p-4 flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
                      오늘의 궁합
                    </p>
                    <div className="flex flex-col gap-2">
                      <span className="self-start text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] bg-[#dbd3fe] rounded-[4px] px-2 py-[2px]">
                        {fortune.궁합좋은상대.유형명}
                      </span>
                      <p className="text-[14px] text-[#3f3f3f] leading-[1.5] tracking-[-0.14px]">
                        {fortune.궁합좋은상대.설명}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="h-9 rounded-[4px] bg-white border border-[#b6d0ff] text-[13px] font-medium text-[#1a75ff] active:opacity-70"
                  >
                    지금 둘러보기
                  </button>
                </div>
              )}

              <div className="bg-[#fff5e5] rounded-[4px] p-4 flex flex-col gap-2">
                <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
                  행운의 아이템
                </p>
                <p className="text-[14px] text-[#1f1f1f] tracking-[-0.14px]">
                  {fortune.행운의아이템}
                </p>
              </div>
            </div>
          </div>

          <PageFooter>
            <CtaButton variant="secondary" onClick={handleShare}>
              {shareMsg ?? "공유하기"}
            </CtaButton>
          </PageFooter>
        </>
      )}
    </Screen>
  );
}
