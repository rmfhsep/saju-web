import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://rfcprmyclrlgnmonjmxd.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3BybXljbHJsZ25tb25qbXhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQzMTIxOSwiZXhwIjoyMDk3MDA3MjE5fQ.aHG5iUGUBOb3I_7-2NSvJFnN-MoupcDaDUCU8rYAF34"

let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  }
  return _supabase
}

export const PROFILE_PHOTOS_BUCKET = "profile-photos"
