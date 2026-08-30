"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/lib/useAppRouter";
import Screen from "@/components/ui/screen";
import EditHeader from "@/components/ui/edit-header";
import CtaButton from "@/components/ui/cta-button";

// app/my/page.tsx와 동일한 카카오톡 채널 채팅 링크
const KAKAO_CHANNEL_CHAT_URL = "https://pf.kakao.com/_VaWxfX/chat";

function GoodMatchContent() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";

  return (
    <Screen>
      <EditHeader title="계정 탈퇴" onBack={() => router.back()} />

      <div className="flex-1 px-5 pt-5 flex flex-col gap-3">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          축하드려요!
          <br />
          좋은 인연의 시작을
          <br />
          마주가 함께할 수 있어 기뻐요.
        </h1>
        <p className="text-[15px] text-[#777] leading-[1.5] tracking-[-0.3px]">
          두 분의 이야기를 들려주시면 더 많은 사람들이 좋은 인연을 만날 수 있도록 소중히 반영할게요.
          <br />
          후기는 이름 없이 닉네임으로 남길 수 있어요.
        </p>
      </div>

      <div className="p-5 flex flex-col gap-4 shrink-0">
        <CtaButton onClick={() => { window.location.href = KAKAO_CHANNEL_CHAT_URL; }}>연애 소식 남기기</CtaButton>
        <button
          type="button"
          onClick={() => router.push(`/my/settings/withdraw/notice?reason=${encodeURIComponent(reason)}`)}
          className="text-[14px] font-semibold text-[#777] tracking-[-0.14px] text-center active:opacity-70"
        >
          탈퇴하기
        </button>
      </div>
    </Screen>
  );
}

export default function GoodMatchPage() {
  return (
    <Suspense>
      <GoodMatchContent />
    </Suspense>
  );
}
