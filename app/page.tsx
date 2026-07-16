"use client";

import { useEffect, useState } from "react";
import { bridgeNavigate } from "@/lib/bridge";
import AppBottomNav, {
  APP_BOTTOM_NAV_HEIGHT,
} from "@/components/ui/app-bottom-nav";

type User = {
  id: number;
  phone: string;
  name: string | null;
  nickname: string | null;
  gender: string | null;
  profileComplete: boolean;
};

type Reco = {
  id: number;
  nickname: string | null;
  name: string | null;
  photos: string | null;
};

const CARD_GRADIENTS = [
  "linear-gradient(160deg, #b5b0d6 0%, #8b7aa8 100%)",
  "linear-gradient(160deg, #a8c4b0 0%, #6b9e7a 100%)",
];

function RecoCard({ reco, gradient }: { reco: Reco; gradient: string }) {
  const photos: string[] = reco.photos ? JSON.parse(reco.photos) : [];
  const displayName = reco.nickname || reco.name || "";
  return (
    <div
      className="snap-center shrink-0 w-[300px] h-[400px] rounded-[16px] relative overflow-hidden bg-[#f4f4f5]"
      style={photos[0] ? undefined : { background: gradient }}
    >
      {photos[0] && (
        <img
          src={photos[0]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* 하단 그라데이션 + 닉네임 */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span className="text-[22px] font-semibold text-white tracking-[-0.44px]">
          {displayName}
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
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
      <div className="px-5 pt-14 pb-6">
        <p className="text-[14px] text-[#6b6b6b]">안녕하세요</p>
        <h1 className="text-[28px] font-bold text-[#0f0f10] mt-1">
          {user.nickname ?? user.name ?? user.phone}님 👋
        </h1>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <h2 className="px-5 text-[18px] font-bold text-[#0f0f10] tracking-[-0.36px]">
          오늘의 추천
        </h2>

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
              />
            ))}
          </div>
        ) : (
          <div className="mx-5 bg-[#f4f4f5] rounded-[12px] p-6 flex flex-col items-center gap-1">
            <p className="text-[15px] font-semibold text-[#1f1f1f]">
              아직 소개할 인연이 없어요
            </p>
            <p className="text-[13px] text-[#777]">
              새로운 인연이 생기면 알려드릴게요.
            </p>
          </div>
        )}
      </div>

      <AppBottomNav />
    </div>
  );
}
