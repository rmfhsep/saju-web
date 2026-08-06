import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://rfcprmyclrlgnmonjmxd.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

let _client: ReturnType<typeof createClient> | null = null

/** 브라우저 전용 Supabase 클라이언트 — anon key만 사용, service role key는 절대 클라이언트에 노출하지 않는다. */
export function getSupabaseClient() {
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return _client
}
