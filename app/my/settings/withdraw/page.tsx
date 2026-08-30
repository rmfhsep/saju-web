"use client";

import { useState } from "react";
import Image from "next/image";
import { useAppRouter } from "@/lib/useAppRouter";
import { bridgeNavigate } from "@/lib/bridge";
import Screen from "@/components/ui/screen";
import EditHeader from "@/components/ui/edit-header";
import TextareaField from "@/components/ui/textarea-field";
import RadioOnIcon from "@/public/icons/Radio_on.svg";
import RadioOffIcon from "@/public/icons/Radio_off.svg";

const REASONS = [
  "좋은 인연을 만났어요.",
  "만나고 싶은 사람이 없어요.",
  "잠시 쉬고 싶어요.",
  "기능이 마음에 들지 않아요.",
  "과금 유도가 잦아요.",
  "기타",
] as const;

const GOOD_MATCH_REASON = "좋은 인연을 만났어요.";
const NO_MATCH_REASON = "만나고 싶은 사람이 없어요.";
const ETC_REASON = "기타";

function ReasonRow({ label, selected, onClick, showDivider }: { label: string; selected: boolean; onClick: () => void; showDivider: boolean }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex flex-col gap-[14.5px]  px-5 text-left">
      <span className="flex items-center gap-3 ">
        <Image src={selected ? RadioOnIcon : RadioOffIcon} alt="" width={24} height={24} className="shrink-0" />
        <span className="flex-1 text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px]">{label}</span>
      </span>
      {showDivider && <span className="h-px w-full bg-[#eaebec]" />}
    </button>
  );
}

function ExitRecommendationModal({ onClose, onWithdraw }: { onClose: () => void; onWithdraw: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleFreeIntro() {
    const token = localStorage.getItem("auth_token");
    if (!token || loading) return;
    setLoading(true);
    try {
      await fetch("/api/users/exit-recommendations", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      bridgeNavigate("Home");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/61" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[16px] font-semibold text-[#1f1f1f] leading-[1.5] tracking-[-0.32px]">
            마음에 드는 인연을 아직 만나지 못하셨나요?
            <br />
            새로운 인연 3명을 무료로 추천해드릴게요.
          </p>
          <p className="text-[15px] text-[#777] leading-[1.5] tracking-[-0.3px]">좋은 인연은 조금 늦게 찾아오기도 해요.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onWithdraw}
            disabled={loading}
            className="flex-1 h-[48px] bg-[#f4f4f5] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80 disabled:opacity-60"
          >
            탈퇴하기
          </button>
          <button
            type="button"
            onClick={handleFreeIntro}
            disabled={loading}
            className="flex-1 h-[48px] bg-[#b6d0ff] rounded-[4px] text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px] active:opacity-80 disabled:opacity-60"
          >
            {loading ? "불러오는 중..." : "무료 소개 받기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawReasonPage() {
  const router = useAppRouter();
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  const valid = !!reason && (reason !== ETC_REASON || detail.trim().length > 0);

  function handleContinue() {
    if (!valid || !reason) return;
    if (reason === GOOD_MATCH_REASON) {
      router.push(`/my/settings/withdraw/good-match?reason=${encodeURIComponent(reason)}`);
      return;
    }
    if (reason === NO_MATCH_REASON) {
      setShowExitModal(true);
      return;
    }
    const params = new URLSearchParams({ reason });
    if (reason === ETC_REASON) params.set("detail", detail.trim());
    router.push(`/my/settings/withdraw/notice?${params.toString()}`);
  }

  function handleWithdrawFromModal() {
    const params = new URLSearchParams({ reason: NO_MATCH_REASON });
    router.push(`/my/settings/withdraw/notice?${params.toString()}`);
  }

  return (
    <Screen>
      <EditHeader title="계정 탈퇴" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto pb-4">
        <div className="flex flex-col gap-3 px-5 pt-0">
          <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">떠나는 이유를 알려주세요.</h1>
          <p className="text-[15px] text-[#777] leading-[1.5] tracking-[-0.3px]">이유를 알려주시면 더 좋은 만남을 만들기 위해 개선할게요.</p>
        </div>

        <div className="flex flex-col mt-10 gap-4">
          {REASONS.map((r, i) => (
            <ReasonRow key={r} label={r} selected={reason === r} onClick={() => setReason(r)} showDivider={i < REASONS.length - 1} />
          ))}
        </div>

        {reason === ETC_REASON && (
          <div className="px-5 pt-2">
            <TextareaField value={detail} onChange={setDetail} placeholder="떠나는 이유를 입력해주세요." rows={2} />
          </div>
        )}
      </div>

      <div className="p-5 flex gap-3 items-end shrink-0">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!valid}
          className={`flex-1 h-9 rounded-[4px] text-[13px] font-medium ${valid ? "bg-[#f4f4f5] text-[#1f1f1f]" : "bg-[#e8e8e8] text-white"}`}
        >
          계속
        </button>
        <button
          type="button"
          onClick={() => router.replace("/my/settings")}
          className="flex-1 h-9 rounded-[4px] bg-[#b6d0ff] text-[13px] font-medium text-[#1f1f1f]"
        >
          그만두기
        </button>
      </div>

      {showExitModal && (
        <ExitRecommendationModal onClose={() => setShowExitModal(false)} onWithdraw={handleWithdrawFromModal} />
      )}
    </Screen>
  );
}
