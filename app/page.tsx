"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { bridgeNavigate } from "@/lib/bridge";
import AppBottomNav, {
  APP_BOTTOM_NAV_HEIGHT,
} from "@/components/ui/app-bottom-nav";
import StarChip from "@/components/ui/star-chip";
import { calcAge } from "@/lib/age";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  phone: string;
  name: string | null;
  nickname: string | null;
  gender: string | null;
  profileComplete: boolean;
  stars: number;
};

type Reco = {
  id: number;
  nickname: string | null;
  name: string | null;
  photos: string | null;
  birthDate: string | null;
  bioTags: string | null;
};

type FortuneLevel = "HIGH" | "MID" | "LOW";

type DailyFortune = {
  level: FortuneLevel;
  text: string;
};

// Figma "BTN/Box/Primary" 3가지 컬러 배리언트 (node 276:8659 / 276:8736 / 276:8813) —
// 오늘의 운세 레벨(LOW/MID/HIGH)에 따라 결정되며, 레벨이 매일 바뀌므로 보는 사람 입장에선
// 색이 랜덤하게 바뀌는 것처럼 느껴진다.
const FORTUNE_LEVEL_CARD: Record<FortuneLevel, string> = {
  LOW: "border-[#ceffca] bg-[#f3fff2]",
  MID: "border-[#ffeec8] bg-[#fffbf3]",
  HIGH: "border-[#c9defe] bg-[#f7fbff]",
};
const FORTUNE_LEVEL_ICON: Record<FortuneLevel, string> = {
  LOW: "/icons/luck_low.png",
  MID: "/icons/luck_middle.png",
  HIGH: "/icons/luck_high.png",
};

function FortuneBanner({
  fortune,
  onClick,
}: {
  fortune: DailyFortune | null;
  onClick: () => void;
}) {
  if (!fortune) {
    return (
      <div className="mx-5 h-[78px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-5 relative flex items-center gap-3 px-4 py-3 rounded-[4px] border text-left active:opacity-80 ${
        FORTUNE_LEVEL_CARD[fortune.level]
      }`}
      style={{
        boxShadow:
          "inset -4px -4px 8px 0 rgba(255,255,255,0.4), inset 4px 4px 8px 0 rgba(255,255,255,0.5)",
      }}
    >
      <img
        src={FORTUNE_LEVEL_ICON[fortune.level]}
        alt=""
        className="w-[52px] h-[52px] shrink-0 object-contain"
      />
      <div className="flex-1 flex flex-col gap-1 text-[15px] tracking-[-0.3px] min-w-0">
        <div className="flex items-center justify-between gap-1.5">
          <p className="font-bold text-[#1f1f1f]">오늘의 연애운</p>
          <svg
            width="6"
            height="12"
            viewBox="0 0 6 12"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M1 1L5 6L1 11"
              stroke="#1f1f1f"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-normal leading-[1.5] text-[#1f1f1f] line-clamp-2">
          {fortune.text}
        </p>
      </div>
    </button>
  );
}

const CARD_GRADIENTS = [
  "linear-gradient(160deg, #b5b0d6 0%, #8b7aa8 100%)",
  "linear-gradient(160deg, #a8c4b0 0%, #6b9e7a 100%)",
];

const MORE_INTRO_COST = 10;

function EmptyTodayCard() {
  return (
    <div className="w-[300px] h-[400px] rounded-[8px] bg-[#f7f7f8] flex flex-col items-center justify-center gap-4">
      <img
        src="/icons/logo-solid-72.svg"
        alt=""
        className="w-[72px] h-[72px]"
      />
      <p className="text-[15px] font-semibold text-[#1f1f1f] tracking-[-0.3px]">
        오늘은 추천 인연이 없어요.
      </p>
    </div>
  );
}

function MoreIntroCard({
  busy,
  onClick,
}: {
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <div className="w-[300px] h-[400px] rounded-[8px] bg-[#e9f1ff] relative flex flex-col items-center pt-[92px] gap-4">
      <img
        src="/icons/more-intro-star.svg"
        alt=""
        className="w-[88px] h-[88px]"
      />
      <div className="flex flex-col items-center gap-0.5 text-[15px] text-center tracking-[-0.3px] text-[#1f1f1f]">
        <p className="font-bold">더 소개 받기</p>
        <p className="font-normal whitespace-nowrap">
          별 {MORE_INTRO_COST}개로 새로운 인연을 더 만나보세요.
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className="absolute bottom-5 left-5 right-5 h-10 rounded-[4px] bg-[#2a2a2a] text-white text-[14px] font-semibold tracking-[-0.14px] disabled:opacity-60"
      >
        {busy ? "불러오는 중…" : "3명 더 소개 받기"}
      </button>
    </div>
  );
}

function RecoCard({
  reco,
  gradient,
  onClick,
}: {
  reco: Reco;
  gradient: string;
  onClick: () => void;
}) {
  const photos: string[] = reco.photos ? JSON.parse(reco.photos) : [];
  const tags: string[] = reco.bioTags ? JSON.parse(reco.bioTags) : [];
  const displayName = reco.nickname || reco.name || "";
  const age = calcAge(reco.birthDate);

  return (
    <div
      onClick={onClick}
      className="w-[300px] h-[400px] rounded-[8px] relative overflow-hidden bg-[#f4f4f5] cursor-pointer"
    >
      <div
        className="absolute inset-0"
        style={photos[0] ? undefined : { background: gradient }}
      >
        {photos[0] && (
          <img
            src={photos[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
      <div
        className="absolute inset-0 rounded-[8px]"
        style={
          {
            background: "rgba(31, 31, 31, 0.52)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            // 스와이프 스크롤 중 backdrop-filter가 프레임마다 재계산되면서 깜빡이는 WebKit 버그 방지 —
            // 별도 GPU 컴포지팅 레이어로 승격시켜 스크롤과 독립적으로 렌더링되게 한다.
            transform: "translateZ(0)",
            willChange: "transform",
          } as React.CSSProperties
        }
      />

      <div className="absolute left-5 right-5 bottom-[28px] flex flex-col gap-2">
        <div className="flex items-center gap-1 text-[20px] font-semibold text-white tracking-[-0.4px]">
          <span>{displayName}</span>
          {age != null && (
            <>
              <span>/</span>
              <span>{age}살</span>
            </>
          )}
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="h-6 flex items-center px-2 py-[3px] rounded-[4px] bg-[#cbdeff] text-[12px] font-medium text-[#1f1f1f] whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recos, setRecos] = useState<Reco[]>([]);
  const [noNewToday, setNoNewToday] = useState(false);
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [recosLoading, setRecosLoading] = useState(true);
  const [moreBusy, setMoreBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleMoreIntro() {
    if (moreBusy) return;
    setMoreBusy(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/users/discover/more", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "no more candidates") {
          showToast("더 이상 추천해줄 이성이 없어요.");
        } else if (data.error === "insufficient stars") {
          showToast("별이 부족해요.");
        } else {
          showToast("잠시 후 다시 시도해주세요.");
        }
        return;
      }
      setRecos(data.users ?? []);
      setUser((prev) => (prev ? { ...prev, stars: data.stars } : prev));
    } catch {
      showToast("잠시 후 다시 시도해주세요.");
    } finally {
      setMoreBusy(false);
    }
  }

  useEffect(() => {
    async function check() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          bridgeNavigate("Landing");
          return;
        }

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("auth_token");
          bridgeNavigate("Landing");
          return;
        }

        const data: User = await res.json();
        if (!data.profileComplete) {
          bridgeNavigate("Landing");
          return;
        }

        setUser(data);

        // 이성 유저 추천 (누적 목록 — 24시간마다 새 추천 배치 추가)
        fetch("/api/users/discover", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.users) setRecos(d.users as Reco[]);
            setNoNewToday(!!d?.noNewToday);
          })
          .catch(() => {})
          .finally(() => setRecosLoading(false));

        // 오늘의 연애운 배너
        fetch("/api/daily-fortune/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.level && d?.text)
              setFortune({ level: d.level, text: d.text });
          })
          .catch(() => {});
      } catch {
        bridgeNavigate("Landing");
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="flex flex-col min-h-screen bg-white"
      style={{ paddingBottom: APP_BOTTOM_NAV_HEIGHT }}
    >
      {/* 헤더 */}
      <div className="h-[52px] flex items-center gap-4 px-5 py-3.5 shrink-0">
        <h1 className="flex-1 text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]">
          추천
        </h1>
        <StarChip stars={user.stars} className="shrink-0" />
      </div>

      <div className="flex-1 flex flex-col gap-7 pt-5">
        {/* 오늘의 연애운 배너 */}
        <FortuneBanner
          fortune={fortune}
          onClick={() => router.push("/today-fortune")}
        />

        {recosLoading ? (
          <Swiper
            slidesPerView="auto"
            spaceBetween={12}
            slidesOffsetBefore={20}
            slidesOffsetAfter={20}
            className="pb-2! w-full min-w-0"
          >
            {[0, 1].map((i) => (
              <SwiperSlide key={i} style={{ width: 300 }}>
                <div className="w-[300px] h-[400px] rounded-[8px] bg-[#f4f4f5] animate-pulse" />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Swiper
            slidesPerView={"auto"}
            spaceBetween={12}
            slidesOffsetBefore={20}
            slidesOffsetAfter={20}
            className="pb-2! w-full min-w-0"
          >
            {noNewToday && (
              <SwiperSlide style={{ width: 300 }}>
                <EmptyTodayCard />
              </SwiperSlide>
            )}
            {recos.map((reco, i) => (
              <SwiperSlide key={reco.id} style={{ width: 300 }}>
                <RecoCard
                  reco={reco}
                  gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                  onClick={() => router.push(`/recommend/${reco.id}`)}
                />
              </SwiperSlide>
            ))}
            <SwiperSlide style={{ width: 300 }}>
              <MoreIntroCard busy={moreBusy} onClick={handleMoreIntro} />
            </SwiperSlide>
          </Swiper>
        )}
      </div>

      {toast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-[60] bg-black/74 text-white text-[14px] font-medium px-6 py-3 rounded-[6px] whitespace-nowrap max-w-[296px] text-center"
          style={{
            bottom: `calc(env(safe-area-inset-bottom) + ${
              APP_BOTTOM_NAV_HEIGHT + 16
            }px)`,
          }}
        >
          {toast}
        </div>
      )}

      <AppBottomNav />
    </div>
  );
}
