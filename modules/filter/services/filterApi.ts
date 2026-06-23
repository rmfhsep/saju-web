import type { FilterData } from "../types"

export async function submitFilter(data: FilterData): Promise<void> {
  const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
  const value = data.category && data.category !== "height" ? data[data.category] : undefined

  await fetch("/api/profile/filter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      type: data.category,
      heightMin: data.heightMin,
      heightMax: data.heightMax,
      value,
    }),
  }).catch(() => {})
}
