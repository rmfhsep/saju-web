import { Prisma } from "@prisma/client"

/** 매칭 풀 파이프라인(하드필터→유저필터→소프트스코어링) 전체가 공유하는 User select. */
export const POOL_USER_SELECT = {
  id: true,
  gender: true,
  nickname: true,
  name: true,
  photos: true,
  birthDate: true,
  bioTags: true,
  bio: true,
  location: true,
  datingPurpose: true,
  height: true,
  smoking: true,
  drinking: true,
  politics: true,
  religion: true,
  sajuResult: true,
  lastLoginAt: true,
  grade: true,
  createdAt: true,
  preferenceFilters: true,
  preferredHeightMin: true,
  preferredHeightMax: true,
  preferredSmoking: true,
  preferredDrinking: true,
  preferredPolitics: true,
  preferredReligion: true,
} satisfies Prisma.UserSelect

export type PoolUser = Prisma.UserGetPayload<{ select: typeof POOL_USER_SELECT }>

/** app/page.tsx RecoCard 등 기존 카드 UI가 요구하는 최소 필드 — lib/recommendations.ts RECO_USER_SELECT와 동일. */
export function toRecoUser(u: PoolUser) {
  return { id: u.id, nickname: u.nickname, name: u.name, photos: u.photos, birthDate: u.birthDate, bioTags: u.bioTags }
}
