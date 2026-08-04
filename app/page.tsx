"use client";

import { useEffect, useState } from "react";
import { bridgeNavigate } from "@/lib/bridge";
import AppBottomNav, {
  APP_BOTTOM_NAV_HEIGHT,
} from "@/components/ui/app-bottom-nav";
import StarIcon from "@/components/ui/star-icon";
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

const CARD_GRADIENTS = [
  "linear-gradient(160deg, #b5b0d6 0%, #8b7aa8 100%)",
  "linear-gradient(160deg, #a8c4b0 0%, #6b9e7a 100%)",
];

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
  const [loading, setLoading] = useState(true);

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

        // 이성 유저 추천 (최대 2명)
        fetch("/api/users/discover", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.users) setRecos((d.users as Reco[]).slice(0, 2));
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
        <div className="flex items-center gap-1 px-3 py-1 rounded-[40px] bg-[#fff5e5] shrink-0">
          <StarIcon size={20} />
          <span className="text-[16px] font-semibold text-[#ff7b2e] tracking-[-0.32px]">
            {user.stars}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5 pt-2">
        {/* 오늘의 연애운 배너 (하드코딩) */}
        <div className="mx-5 flex items-center gap-3 px-4 py-3 rounded-[4px] border border-[#ceffca] bg-[#f3fff2]">
          <img
            src="/icons/luck-clover.png"
            alt=""
            className="w-[52px] h-[52px] shrink-0 object-contain"
          />
          <div className="flex-1 flex flex-col gap-1 text-[15px] tracking-[-0.3px]">
            <p className="font-bold text-[#1f1f1f]">오늘의 연애운</p>
            <p className="font-normal leading-[1.5] text-[#1f1f1f]">
              오늘은 흐름이 살짝 느려요. 잠깐 쉬어가며 나만의 시간을 가져보세요.
            </p>
          </div>
        </div>

        {recos.length > 0 ? (
          <div
            className="overflow-x-auto flex gap-3 px-5 pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {recos.map((reco, i) => (
              <RecoCard
                key={reco.id}
                reco={reco}
                gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                onClick={() => router.push(`/recommend/${reco.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="mx-5 h-[400px] bg-[#f4f4f5] rounded-[8px] flex flex-col items-center justify-center gap-4">
            <img src="/logo.svg" alt="" className="w-[72px] h-[72px]" />
            <p className="text-[15px] font-semibold text-[#1f1f1f]">
              오늘은 추천 인연이 없어요
            </p>
          </div>
        )}
      </div>

      <AppBottomNav />
    </div>
  );
}
