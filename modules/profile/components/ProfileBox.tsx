"use client"

import { bridgeBack } from "@/lib/bridge"
import { useProfileForm } from "../hooks/useProfileForm"
import {
  SMOKING_OPTIONS, DRINKING_OPTIONS, DATING_OPTIONS,
  POLITICS_OPTIONS, RELIGION_OPTIONS, TOTAL_STEPS,
} from "../constants"
import StepIntro from "./StepIntro"
import StepNickname from "./StepNickname"
import StepLocation from "./StepLocation"
import StepJob from "./StepJob"
import StepHeight from "./StepHeight"
import StepRadio from "./StepRadio"
import StepIncome from "./StepIncome"
import StepPhotos from "./StepPhotos"
import StepBioTags from "./StepBioTags"
import StepBio from "./StepBio"

export default function ProfileBox() {
  const { step, data, update, next, back } = useProfileForm()

  const displayStep = Math.min(Math.max(step, 1), TOTAL_STEPS)
  const props = { data, onChange: update, onNext: next, onBack: back, step: displayStep }

  if (step === 0)  return <StepIntro onNext={next} onBack={bridgeBack} />
  if (step === 1)  return <StepNickname {...props} />
  if (step === 2)  return <StepLocation {...props} />
  if (step === 3)  return <StepJob {...props} />
  if (step === 4)  return <StepHeight {...props} />
  if (step === 5)  return <StepRadio {...props} title="흡연 여부를 알려주세요." options={SMOKING_OPTIONS} value={data.smoking} onChange={v => update({ smoking: v })} />
  if (step === 6)  return <StepRadio {...props} title="음주 빈도를 알려주세요." options={DRINKING_OPTIONS} value={data.drinking} onChange={v => update({ drinking: v })} />
  if (step === 7)  return <StepRadio {...props} title="연애 목적을 알려주세요." options={DATING_OPTIONS} value={data.datingPurpose} onChange={v => update({ datingPurpose: v })} />
  if (step === 8)  return <StepRadio {...props} title="정치 성향을 알려주세요." options={POLITICS_OPTIONS} value={data.politics} onChange={v => update({ politics: v })} />
  if (step === 9)  return <StepRadio {...props} title="종교를 알려주세요." options={RELIGION_OPTIONS} value={data.religion} onChange={v => update({ religion: v })} />
  if (step === 10) return <StepIncome {...props} />
  if (step === 11) return <StepPhotos {...props} />
  if (step === 12) return <StepBioTags {...props} />
  if (step === 13) return <StepBio {...props} />
  return null
}
