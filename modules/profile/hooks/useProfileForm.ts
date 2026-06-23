"use client"

import { useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"
import { submitProfile } from "../services/profileApi"
import { TOTAL_STEPS } from "../constants"
import type { ProfileData } from "../types"

const INITIAL_DATA: ProfileData = {
  nickname: "", location: "", job: "", jobDetail: "",
  height: "", smoking: "", drinking: "", datingPurpose: "",
  politics: "", religion: "", income: "", photos: [],
  bioTags: [], bio: {},
}

export function useProfileForm() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<ProfileData>(INITIAL_DATA)

  function update(d: Partial<ProfileData>) { setData(prev => ({ ...prev, ...d })) }
  function next() { if (step < TOTAL_STEPS + 1) setStep(s => s + 1); else finish() }
  function back() { if (step === 0) bridgeBack(); else setStep(s => s - 1) }

  async function finish() {
    await submitProfile(data)
    bridgeNavigate("Filter")
  }

  return { step, data, update, next, back }
}
