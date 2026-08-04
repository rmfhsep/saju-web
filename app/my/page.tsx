"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bridgeNavigate } from "@/lib/bridge";
import AppBottomNav, {
  APP_BOTTOM_NAV_HEIGHT,
} from "@/components/ui/app-bottom-nav";
import StarIcon from "@/components/ui/star-icon";

// 문의하기 → 카카오톡 비즈니스 채널 1:1 채팅
const KAKAO_CHANNEL_CHAT_URL = "https://pf.kakao.com/_VaWxfX/chat";

type MeUser = {
  nickname: string | null;
  name: string | null;
  gender: string | null;
  photos: string | null;
  stars: number;
  filterComplete: boolean;
  preferredFilterType: string | null;
  preferredHeightMin: number | null;
  preferredHeightMax: number | null;
  preferredSmoking: string | null;
  preferredDrinking: string | null;
  preferredPolitics: string | null;
  preferredReligion: string | null;
};

// 선호 조건 요약 문구 — 마이 홈의 "선호하는 조건 설정" 셀 서브타이틀
function filterSummary(u: MeUser): string | null {
  if (!u.filterComplete || !u.preferredFilterType) return null;
  switch (u.preferredFilterType) {
    case "height": {
      if (u.preferredHeightMin == null || u.preferredHeightMax == null)
        return "키";
      const boundary = u.gender === "MALE" ? 170 : 200;
      const maxLabel =
        u.preferredHeightMax >= boundary
          ? `${u.preferredHeightMax}+`
          : `${u.preferredHeightMax}`;
      return `키, ${u.preferredHeightMin}~${maxLabel}cm`;
    }
    case "smoking":
      return u.preferredSmoking
        ? `흡연 여부, ${u.preferredSmoking}`
        : "흡연 여부";
    case "drinking":
      return u.preferredDrinking
        ? `음주 빈도, ${u.preferredDrinking}`
        : "음주 빈도";
    case "politics":
      return u.preferredPolitics
        ? `정치 성향, ${u.preferredPolitics}`
        : "정치 성향";
    case "religion":
      return u.preferredReligion ? `종교, ${u.preferredReligion}` : "종교";
    default:
      return null;
  }
}

function ListCell({
  icon,
  label,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-start px-5 active:bg-[#fafafa]"
    >
      <div className="w-full flex items-center gap-3 py-4">
        <span className="shrink-0 w-5 h-5 flex items-center justify-center">
          {icon}
        </span>
        <span className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
          <span className="text-left text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px]">
            {label}
          </span>
          {subtitle && (
            <span className="text-left text-[12px] font-normal text-[#949494] tracking-[-0.12px]">
              {subtitle}
            </span>
          )}
        </span>
      </div>
      <div className="w-full h-px bg-[#eaebec]" />
    </button>
  );
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      bridgeNavigate("Landing");
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {});
  }, []);

  const photos: string[] = user?.photos ? JSON.parse(user.photos) : [];
  const displayName = user?.nickname || user?.name || "";
  const summary = user ? filterSummary(user) : null;

  return (
    <div
      className="flex flex-col min-h-screen bg-white"
      style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}
    >
      {/* 헤더: 닉네임 + 보유 별 칩 */}
      <div className="h-[52px] flex items-center justify-between px-5">
        <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
          {displayName}
        </span>
        <button
          onClick={() => router.push("/my/store")}
          className="flex items-center gap-1.5 h-[34px] pl-3 pr-3.5 bg-[#fff5e5] rounded-full active:opacity-80"
        >
          <StarIcon size={20} color="#FFA100" />
          <span className="text-[16px] font-bold text-[#ff7b2e] tracking-[-0.32px]">
            {user?.stars ?? 0}
          </span>
        </button>
      </div>

      {/* 프로필 */}
      <div className="flex flex-col gap-4 items-center pt-7 pb-8">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-[#f4f4f5] flex items-center justify-center">
          {photos[0] ? (
            <img
              src={photos[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[36px] font-semibold text-[#b7b7b7]">
              {displayName.slice(0, 1)}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/my/edit")}
          className="h-[36px] px-4 bg-[#e9f1ff] rounded-[4px] text-[13px] font-medium text-[#1a75ff] active:opacity-80"
        >
          프로필 수정
        </button>
      </div>

      {/* 리스트 */}
      <div className="w-full flex flex-col">
        <ListCell
          label="선호하는 조건 설정"
          subtitle={summary}
          onClick={() => router.push("/my/filter")}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 6h9M15 6h2M3 14h2M8 14h9"
                stroke="#1f1f1f"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle
                cx="13.5"
                cy="6"
                r="2"
                stroke="#1f1f1f"
                strokeWidth="1.5"
              />
              <circle
                cx="6.5"
                cy="14"
                r="2"
                stroke="#1f1f1f"
                strokeWidth="1.5"
              />
            </svg>
          }
        />
        <ListCell
          label="내 연애운 리포트"
          onClick={() => router.push("/my/report")}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect
                x="3.5"
                y="2.5"
                width="13"
                height="15"
                rx="2"
                stroke="#1f1f1f"
                strokeWidth="1.5"
              />
              <path
                d="M10 12.2c-2-1.3-3.2-2.4-3.2-3.7 0-1 .8-1.6 1.6-1.6.6 0 1.2.3 1.6.9.4-.6 1-.9 1.6-.9.8 0 1.6.6 1.6 1.6 0 1.3-1.2 2.4-3.2 3.7z"
                fill="#1f1f1f"
              />
            </svg>
          }
        />
        <ListCell
          label="지인 차단"
          onClick={() => router.push("/my/blocking")}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="7.5"
                stroke="#1f1f1f"
                strokeWidth="1.5"
              />
              <path
                d="M5 15L15 5"
                stroke="#1f1f1f"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <ListCell
          label="설정"
          onClick={() => router.push("/my/settings")}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="2.5"
                stroke="#1f1f1f"
                strokeWidth="1.5"
              />
              <path
                d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7"
                stroke="#1f1f1f"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <ListCell
          label="문의하기"
          onClick={() => {
            window.location.href = KAKAO_CHANNEL_CHAT_URL;
          }}
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 4.5h12a1 1 0 011 1v7a1 1 0 01-1 1H8l-3 2.5v-2.5a1 1 0 01-1-1v-7a1 1 0 011-1z"
                stroke="#1f1f1f"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <AppBottomNav />
    </div>
  );
}
