import { NextRequest } from "next/server"

/** Vercel Cron이 CRON_SECRET 설정 시 자동으로 붙이는 Authorization 헤더를 검증한다. */
export function isAuthorizedCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return req.headers.get("authorization") === `Bearer ${secret}`
}
