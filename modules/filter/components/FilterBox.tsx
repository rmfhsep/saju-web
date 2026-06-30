"use client"

import { useEffect, useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"
import CategoryStep from "./CategoryStep"
import DetailStep from "./DetailStep"
import { submitFilter } from "../services/filterApi"
import { defaultHeightRange, HEIGHT_RANGES } from "../constants"
import type { FilterData } from "../types"

const INITIAL_RANGE = HEIGHT_RANGES.MALE
const INITIAL_DEFAULT = defaultHeightRange(INITIAL_RANGE.min, INITIAL_RANGE.max)

const INITIAL_DATA: FilterData = {
  category: null,
  heightMin: INITIAL_DEFAULT.min,
  heightMax: INITIAL_DEFAULT.max,
  smoking: "", drinking: "", politics: "", religion: "",
}

export default function FilterBox() {
  const [step, setStep] = useState<"category" | "detail">("category")
  const [data, setData] = useState<FilterData>(INITIAL_DATA)
  const [heightRange, setHeightRange] = useState<{ min: number; max: number }>(INITIAL_RANGE)
  const [submitting, setSubmitting] = useState(false)

  // 내 성별 기준으로 상대 키 필터 범위를 결정 (여성: 168~200, 남성: 140~170)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (!user || user.gender !== "FEMALE") return
        const range = HEIGHT_RANGES.FEMALE
        const def = defaultHeightRange(range.min, range.max)
        setHeightRange(range)
        setData(prev => ({ ...prev, heightMin: def.min, heightMax: def.max }))
      })
      .catch(() => {})
  }, [])

  function update(d: Partial<FilterData>) { setData(prev => ({ ...prev, ...d })) }

  async function handleSubmit() {
    if (!data.category || submitting) return
    setSubmitting(true)
    try {
      await submitFilter(data)
      bridgeNavigate("Home")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "category") {
    return (
      <CategoryStep
        value={data.category}
        onSelect={key => update({ category: key })}
        onNext={() => data.category && setStep("detail")}
        onBack={bridgeBack}
      />
    )
  }

  return (
    <DetailStep
      category={data.category!}
      data={data}
      heightMin={heightRange.min}
      heightMax={heightRange.max}
      onChange={update}
      onSubmit={handleSubmit}
      onBack={() => setStep("category")}
      submitting={submitting}
    />
  )
}
