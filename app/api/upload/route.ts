import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin, PROFILE_PHOTOS_BUCKET } from "@/lib/supabase"

async function ensureBucket() {
  const supabase = getSupabaseAdmin()
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some(b => b.name === PROFILE_PHOTOS_BUCKET)) {
    await supabase.storage.createBucket(PROFILE_PHOTOS_BUCKET, { public: true })
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const phone = (formData.get("phone") as string | null) || "anonymous"
  const files = formData.getAll("files").filter((f): f is File => f instanceof File)

  if (files.length === 0) {
    return NextResponse.json({ error: "no files" }, { status: 400 })
  }

  await ensureBucket()
  const supabase = getSupabaseAdmin()

  const urls: string[] = []
  for (const file of files) {
    const ext = file.name.split(".").pop() || "jpg"
    const path = `${phone}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from(PROFILE_PHOTOS_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return NextResponse.json({ urls })
}
