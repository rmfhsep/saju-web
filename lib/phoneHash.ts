import { createHmac } from "crypto"

/**
 * One-way HMAC for third-party contact numbers collected via the device
 * address book (blocking flow). We only ever need equality checks against
 * a candidate's own phone — never the original number back out — so a
 * salted one-way hash is sufficient and avoids storing raw third-party PII.
 */
const secret = process.env.PHONE_HASH_SECRET ?? "saju-dev-secret"

export function hashPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "")
  return createHmac("sha256", secret).update(digits).digest("hex")
}

export function hashPhones(rawPhones: string[]): string[] {
  return rawPhones.map(hashPhone)
}

/** Check whether a candidate's phone is in a user's stored (hashed) block list. */
export function isPhoneBlocked(candidatePhone: string, blockedPhonesJson: string | null): boolean {
  if (!blockedPhonesJson) return false
  let hashedList: string[]
  try {
    hashedList = JSON.parse(blockedPhonesJson)
  } catch {
    return false
  }
  return hashedList.includes(hashPhone(candidatePhone))
}
