"use client"

import { useState } from "react"
import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import { ProfileChipIcon, CarouselIndicator, type ChipIconState } from "@/components/ui/profile-detail-icons"
import { useMe } from "@/lib/queries/useMe"
import { calcAge, birthYearLabel } from "@/lib/age"

const PURPOSE_SHORT_LABEL: Record<string, string> = {
  "아직은 연애에만 집중하고 싶어요.": "연애에만 집중",
  "결혼을 고려한 연애를 하고 싶어요.": "결혼 고려",
  "잘 모르겠어요.": "고민 중",
}

function InfoChip({ state, label }: { state: ChipIconState; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#f4f4f5] shrink-0">
      <ProfileChipIcon state={state} size={20} />
      <span className="text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] whitespace-nowrap">{label}</span>
    </div>
  )
}

function BioCard({ tag, desc }: { tag: string; desc: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-[4px] border border-[#cbdeff] bg-[#e9f1ff] w-full">
      <p className="text-[17px] font-bold text-[#1f1f1f] tracking-[-0.34px]">{tag}</p>
      <p className="text-[15px] font-normal leading-[1.5] text-[#555] tracking-[-0.3px]">{desc}</p>
    </div>
  )
}

export default function ProfilePreviewPage() {
  const router = useAppRouter()
  const [tab, setTab] = useState<"card" | "detail">("card")
  const meQuery = useMe()
  const user = meQuery.data ?? null
  const loading = meQuery.isLoading
  const [photoIndex, setPhotoIndex] = useState(0)

  const photos: string[] = user?.photos ? JSON.parse(user.photos) : []
  const tags: string[] = user?.bioTags ? JSON.parse(user.bioTags) : []
  const bio: Record<string, string> = user?.bio ? JSON.parse(user.bio) : {}
  const displayName = user?.nickname || user?.name || ""
  const age = calcAge(user?.birthDate ?? null)

  return (
    <Screen>
      <EditHeader title="내 프로필 확인하기" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto pb-9">
        <div className="flex flex-col items-center gap-8 pt-5">
          {/* 탭 */}
          <div className="bg-[#f4f4f5] rounded-[8px] p-1 flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setTab("card")}
              className={`h-[36px] w-[100px] rounded-[4px] flex items-center justify-center text-[14px] tracking-[-0.14px] ${
                tab === "card" ? "bg-white font-semibold text-[#1f1f1f]" : "font-normal text-[#777]"
              }`}
            >
              프로필 카드
            </button>
            <button
              type="button"
              onClick={() => setTab("detail")}
              className={`h-[36px] w-[100px] rounded-[4px] flex items-center justify-center text-[14px] tracking-[-0.14px] ${
                tab === "detail" ? "bg-white font-semibold text-[#1f1f1f]" : "font-normal text-[#777]"
              }`}
            >
              상세 프로필
            </button>
          </div>

          {loading ? (
            <div className="w-[300px] h-[400px] rounded-[8px] bg-[#f4f4f5] animate-pulse" />
          ) : tab === "card" ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <p className="text-[12px] font-medium text-[#949494] text-center px-5 w-full">
                상대방에게 프로필 카드는 이렇게 보여요.
              </p>
              <div className="w-[300px] h-[400px] rounded-[8px] relative overflow-hidden bg-[#f4f4f5] shrink-0">
                {photos[0] ? (
                  <img src={photos[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/logo.svg" alt="" className="w-16 h-16 opacity-40" />
                  </div>
                )}
                <div
                  className="absolute inset-0 rounded-[8px]"
                  style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.4) 100%)" }}
                />
                <div className="absolute left-5 right-5 bottom-5 flex flex-col gap-2">
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
                      {tags.map(tag => (
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
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center w-full">
              <p className="text-[12px] font-medium text-[#949494] text-center px-5 w-full">
                상대방에게 상세 프로필은 이렇게 보여요.
              </p>
              <div className="flex flex-col gap-10 items-center w-full">
                <div className="relative w-full h-[500px] bg-[#f4f4f5] shrink-0">
                  {photos.length > 0 ? (
                    <div
                      className="flex h-full overflow-x-auto snap-x snap-mandatory"
                      style={{ scrollbarWidth: "none" }}
                      onScroll={e => {
                        const w = e.currentTarget.clientWidth
                        setPhotoIndex(Math.round(e.currentTarget.scrollLeft / w))
                      }}
                    >
                      {photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="w-full h-full object-cover shrink-0 snap-center" />
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <img src="/logo.svg" alt="" className="w-16 h-16" />
                    </div>
                  )}
                  {photos.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                      <CarouselIndicator count={photos.length} activeIndex={photoIndex} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-[68px] px-5 w-full">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-1 text-[24px] font-bold text-[#1f1f1f] tracking-[-0.48px]">
                      <span>{displayName}</span>
                      {age != null && (
                        <>
                          <span>/</span>
                          <span>{age}살</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {user && birthYearLabel(user.birthDate) && (
                        <InfoChip state="birthday" label={birthYearLabel(user.birthDate)!} />
                      )}
                      {user?.height != null && <InfoChip state="tall" label={`${user.height}cm`} />}
                      {user?.job && (
                        <InfoChip state="job" label={user.jobDetail ? `${user.job} · ${user.jobDetail}` : user.job} />
                      )}
                      {user?.location && <InfoChip state="location" label={user.location} />}
                      {user?.smoking && <InfoChip state="tabacco" label={user.smoking} />}
                      {user?.drinking && <InfoChip state="alchohol" label={user.drinking} />}
                      {user?.datingPurpose && (
                        <InfoChip state="purpose" label={PURPOSE_SHORT_LABEL[user.datingPurpose] ?? user.datingPurpose} />
                      )}
                      {user?.politics && <InfoChip state="politics" label={user.politics} />}
                      {user?.religion && <InfoChip state="religion" label={user.religion} />}
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {tags.map(tag => (
                        <BioCard key={tag} tag={tag} desc={bio[tag] ?? ""} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}
