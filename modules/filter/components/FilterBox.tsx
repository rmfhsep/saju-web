"use client"

import { useState } from "react"
import { bridgeBack, bridgeNavigate } from "@/lib/bridge"
import CategoryStep from "./CategoryStep"
import DetailStep from "./DetailStep"
import { submitFilter } from "../services/filterApi"
import { DEFAULT_HEIGHT_MAX, DEFAULT_HEIGHT_MIN } from "../constants"
import type { FilterData } from "../types"

const INITIAL_DATA: FilterData = {
  category: null,
  heightMin: DEFAULT_HEIGHT_MIN,
  heightMax: DEFAULT_HEIGHT_MAX,
  smoking: "", drinking: "", politics: "", religion: "",
}

export default function FilterBox() {
  const [step, setStep] = useState<"category" | "detail">("category")
  const [data, setData] = useState<FilterData>(INITIAL_DATA)
  const [submitting, setSubmitting] = useState(false)

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
      onChange={update}
      onSubmit={handleSubmit}
      onBack={() => setStep("category")}
      submitting={submitting}
    />
  )
}
