"use client";

import { useEffect, useState } from "react";
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

const FORTUNE_LEVEL_LABEL: Record<FortuneLevel, string> = { HIGH: "좋음", MID: "보통", LOW: "주의" };
const FORTUNE_LEVEL_BADGE: Record<FortuneLevel, string> = {
  HIGH: "text-[#ff7b2e] bg-[#fff5e5]",
  MID: "text-[#6b6b6b] bg-[#f4f4f5]",
  LOW: "text-[#6b6b6b] bg-[#f4f4f5]",
};
const FORTUNE_LEVEL_CARD: Record<FortuneLevel, string> = {
  HIGH: "border-[#ceffca] bg-[#f3fff2]",
  MID: "border-[#e5e5e5] bg-[#f7f7f8]",
  LOW: "border-[#e5e5e5] bg-[#f7f7f8]",
};

function FortuneBanner({ fortune, onClick }: { fortune: DailyFortune | null; onClick: () => void }) {
  if (!fortune) {
    return <div className="mx-5 h-[78px] rounded-[4px] bg-[#f4f4f5] animate-pulse" />;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mx-5 flex items-center gap-3 px-4 py-3 rounded-[4px] border text-left active:opacity-80 ${FORTUNE_LEVEL_CARD[fortune.level]}`}
    >
      <img src="/icons/luck-clover.png" alt="" className="w-[52px] h-[52px] shrink-0 object-contain" />
      <div className="flex-1 flex flex-col gap-1 text-[15px] tracking-[-0.3px] min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-[#1f1f1f]">오늘의 연애운</p>
          <span className={`text-[11px] font-semibold rounded-[4px] px-1.5 py-[2px] ${FORTUNE_LEVEL_BADGE[fortune.level]}`}>
            {FORTUNE_LEVEL_LABEL[fortune.level]}
          </span>
        </div>
        <p className="font-normal leading-[1.5] text-[#1f1f1f] truncate">{fortune.text}</p>
      </div>
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0">
        <path d="M1 1L6 6L1 11" stroke="#b7b7b7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
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
    <div className="snap-center shrink-0 w-[300px] h-[400px] rounded-[8px] bg-[#f7f7f8] flex flex-col items-center justify-center gap-4">
      <img src="/icons/logo-solid-72.svg" alt="" className="w-[72px] h-[72px]" />
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
    <div className="snap-center shrink-0 w-[300px] h-[400px] rounded-[8px] bg-[#e9f1ff] relative flex flex-col items-center pt-[92px] gap-4">
      <img src="/icons/more-intro-star.svg" alt="" className="w-[88px] h-[88px]" />
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
      className="snap-center shrink-0 w-[300px] h-[400px] rounded-[8px] relative overflow-hidden bg-[#f4f4f5] cursor-pointer"
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
        style={{ background: "rgba(31, 31, 31, 0.52)", backdropFilter: "blur(10px)" }}
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
            if (d?.level && d?.text) setFortune({ level: d.level, text: d.text });
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

      <div className="flex-1 flex flex-col gap-5 pt-2">
        {/* 오늘의 연애운 배너 */}
        <FortuneBanner fortune={fortune} onClick={() => router.push("/today-fortune")} />

        {recosLoading ? (
          <div
            className="overflow-x-auto flex gap-3 px-5 pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className="snap-center shrink-0 w-[300px] h-[400px] rounded-[8px] bg-[#f4f4f5] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="overflow-x-auto flex gap-3 px-5 pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {noNewToday && <EmptyTodayCard />}
            {recos.map((reco, i) => (
              <RecoCard
                key={reco.id}
                reco={reco}
                gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                onClick={() => router.push(`/recommend/${reco.id}`)}
              />
            ))}
            <MoreIntroCard busy={moreBusy} onClick={handleMoreIntro} />
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 z-[60] bg-black/74 text-white text-[14px] font-medium px-6 py-3 rounded-[6px] whitespace-nowrap max-w-[296px] text-center" style={{ bottom: `calc(env(safe-area-inset-bottom) + ${APP_BOTTOM_NAV_HEIGHT + 16}px)` }}>
          {toast}
        </div>
      )}

      <AppBottomNav />
    </div>
  );
}
