"use client";

import { useEffect } from "react";
import { useAppRouter } from "@/lib/useAppRouter";
import { bridgeNavigate } from "@/lib/bridge";
import Screen from "@/components/ui/screen";
import AppBottomNav, {
  APP_BOTTOM_NAV_HEIGHT,
} from "@/components/ui/app-bottom-nav";
import StarChip from "@/components/ui/star-chip";
import IntroBanner from "@/components/ui/intro-banner";
import { useBioIncomplete } from "@/lib/useBioIncomplete";
import { useMe, type MeUser } from "@/lib/queries/useMe";
import FilterIcon from "@/public/icons/filter.svg"
import LoveLuckIcon from "@/public/icons/loveluck.svg"
import ProfileCardIcon from "@/public/icons/profileCard.svg"
import ProhibitionIcon from "@/public/icons/prohibition.svg"
import SettingIcon from "@/public/icons/setting.svg"
import KakaoIcon from "@/public/icons/kakao.svg"
import Image from "next/image";

// 문의하기 → 카카오톡 비즈니스 채널 1:1 채팅
const KAKAO_CHANNEL_CHAT_URL = "https://pf.kakao.com/_VaWxfX/chat";

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
  const router = useAppRouter();
  const meQuery = useMe();
  const user = meQuery.data ?? null;
  const bioIncomplete = useBioIncomplete(user);

  useEffect(() => {
    if (meQuery.isLoading) return;
    if (!user) bridgeNavigate("Landing");
  }, [meQuery.isLoading, user]);

  const photos: string[] = user?.photos ? JSON.parse(user.photos) : [];
  const displayName = user?.nickname || user?.name || "";
  const summary = user ? filterSummary(user) : null;

  return (
    <Screen>
      {/* 헤더: 닉네임 + 보유 별 칩 */}
      <div className="h-[52px] flex items-center justify-between px-5 shrink-0">
        <span className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
          {displayName}
        </span>
        <StarChip stars={user?.stars ?? 0} onClick={() => router.push("/my/store")} />
      </div>

      <div
        className="flex-1 scroll-area overflow-y-auto"
        style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT + 36 }}
      >
        {/* 프로필 + 자기소개 유도 배너 */}
        <div className="flex flex-col gap-4 items-center pt-7 pb-8">
          <div className="flex flex-col gap-4 items-center">
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

          {user && bioIncomplete && <IntroBanner onClick={() => router.push("/my/edit/bio/0")} />}
        </div>

        {/* 리스트 */}
        <div className="w-full flex flex-col">
          <ListCell
            label="선호하는 조건 설정"
            subtitle={summary}
            onClick={() => router.push("/my/filter")}
            icon={
              <Image src={FilterIcon} alt="filter" width={20} height={20} />
            }
          />
          <ListCell
            label="내 연애운 리포트"
            onClick={() => router.push("/my/report")}
            icon={
              <Image src={LoveLuckIcon} alt="love luck" width={20} height={20} />
            }
          />
          <ListCell
            label="내 프로필 확인하기"
            onClick={() => router.push("/my/profile-preview")}
            icon={
              <Image src={ProfileCardIcon} alt="profile card" width={20} height={20} />
            }
          />
          <ListCell
            label="지인 차단"
            onClick={() => router.push("/my/blocking")}
            icon={
              <Image src={ProhibitionIcon} alt="prohibition" width={20} height={20} />
            }
          />
          <ListCell
            label="설정"
            onClick={() => router.push("/my/settings")}
            icon={
              <Image src={SettingIcon} alt="setting" width={20} height={20} />
            }
          />
          <ListCell
            label="문의하기"
            onClick={() => {
              window.location.href = KAKAO_CHANNEL_CHAT_URL;
            }}
            icon={
              <Image src={KakaoIcon} alt="kakao" width={20} height={20} />
            }
          />
        </div>
      </div>

      <AppBottomNav />
    </Screen>
  );
}
