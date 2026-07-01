import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode("JWT_SECRET_REMOVED")

export async function signToken(payload: { userId: number; phone: string }) {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("90d")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<{ userId: number; phone: string }> {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: number; phone: string }
}
