export type ProfileData = {
  nickname: string
  location: string
  job: string
  jobDetail: string
  height: string
  smoking: string
  drinking: string
  datingPurpose: string
  politics: string
  religion: string
  income: string
  photos: string[]
  bioTags: string[]
  bio: Record<string, string>
}

export interface StepProps {
  data: ProfileData
  onChange: (d: Partial<ProfileData>) => void
  onNext: () => void
  onBack: () => void
  step: number
}
