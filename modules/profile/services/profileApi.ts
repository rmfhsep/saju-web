import type { ProfileData } from "../types"

export async function submitProfile(data: ProfileData): Promise<void> {
  const phone = typeof window !== "undefined" ? localStorage.getItem("user_phone") ?? "" : ""
  await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone,
      ...data,
      photos: JSON.stringify(data.photos),
      bioTags: JSON.stringify(data.bioTags),
      bio: JSON.stringify(data.bio),
    }),
  }).catch(() => {})
}
