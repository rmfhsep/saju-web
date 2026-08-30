"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@/lib/useAppRouter";
import { navigateAndReplace } from "@/lib/bridge";
import Screen from "@/components/ui/screen";
import EditHeader from "@/components/ui/edit-header";
import Checkbox from "@/components/ui/checkbox";
import { WarningIcon } from "@/components/ui/icons";

const NOTICE_ITEMS = [
  "프로필 및 작성한 모든 정보가 삭제돼요.",
  "보유 중인 별이 모두 소멸되어 환불되지 않아요.",
  "받은 호감과 매칭 내역이 모두 삭제돼요.",
  "탈퇴 후 15일간 재가입이 제한돼요.",
];

function WithdrawNoticeContent() {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "";
  const detail = searchParams.get("detail") ?? undefined;

  const [agreed, setAgreed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleWithdraw() {
    const token = localStorage.getItem("auth_token");
    if (!token || !agreed || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason, detail }),
      });
      if (res.ok) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_phone");
        navigateAndReplace("Landing");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen>
      <EditHeader title="계정 탈퇴" onBack={() => router.back()} />

      <div className="flex-1 px-5 pt-5 flex flex-col gap-10">
        <h1 className="text-[24px] font-bold text-[#1f1f1f] leading-[1.4] tracking-[-0.48px]">
          탈퇴 후 15일 간 재가입이 제한돼요.
          <br />
          떠나시기 전에 꼭 확인해 주세요.
        </h1>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <WarningIcon size={24} />
            <span className="text-[17px] font-medium text-[#1f1f1f] tracking-[-0.34px]">탈퇴 시 유의사항</span>
          </div>
          <ul className="flex flex-col gap-2 bg-[#fffafa] rounded-[6px] p-4">
            {NOTICE_ITEMS.map(item => (
              <li key={item} className="list-disc ms-[21px] text-[14px] text-[#1f1f1f] leading-[1.5] tracking-[-0.14px]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-7 shrink-0">
        <label className="flex items-center gap-2">
          <Checkbox checked={agreed} onChange={() => setAgreed(v => !v)} />
          <span className="text-[15px] font-medium text-[#1f1f1f] tracking-[-0.3px]">위 유의사항을 읽고 동의합니다.</span>
          <span className="text-[12px] font-medium text-[#1a75ff]">필수</span>
        </label>
        <div className="flex gap-3 items-end">
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!agreed || deleting}
            className={`flex-1 h-9 rounded-[4px] text-[13px] font-medium ${agreed ? "bg-[#f4f4f5] text-[#1f1f1f]" : "bg-[#e8e8e8] text-white"}`}
          >
            {deleting ? "탈퇴 중..." : "탈퇴하기"}
          </button>
          <button
            type="button"
            onClick={() => router.replace("/my/settings")}
            className="flex-1 h-9 rounded-[4px] bg-[#b6d0ff] text-[13px] font-medium text-[#1f1f1f]"
          >
            그만두기
          </button>
        </div>
      </div>
    </Screen>
  );
}

export default function WithdrawNoticePage() {
  return (
    <Suspense>
      <WithdrawNoticeContent />
    </Suspense>
  );
}
