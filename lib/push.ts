import { prisma } from "@/lib/db"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"

/**
 * FCM 자격 증명은 .env의 FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY(_B64) 로 구성한다.
 * (Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성 으로 받는 JSON의 값들)
 * 여러 줄 PEM 키를 .env에 그대로 넣으면 dotenv/dotenvx 파서가 줄바꿈·따옴표를 깨뜨리는 경우가 있어,
 * FIREBASE_PRIVATE_KEY_B64(원본 PEM을 base64로 인코딩한 값)를 우선 지원한다.
 * 아직 값이 없으면 발송을 건너뛰고 경고만 로그로 남긴다 — 앱이 죽지 않도록.
 */
function getMessagingClient() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY_B64
    ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf8")
    : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) return null

  if (getApps().length === 0) {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  }
  return getMessaging()
}

export async function sendPushNotification(userId: number, payload: { title: string; body: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushEnabled: true, pushToken: true },
  })
  if (!user?.pushEnabled || !user.pushToken) return

  const messaging = getMessagingClient()
  if (!messaging) {
    console.warn("[push] FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY not set — skipping send:", payload.title)
    return
  }

  try {
    await messaging.send({
      token: user.pushToken,
      notification: { title: payload.title, body: payload.body },
    })
  } catch (err) {
    console.error(`[push] failed to send to user ${userId}:`, err)
    // 토큰이 만료/폐기된 경우 다음 발송 낭비를 막기 위해 지운다.
    const code = (err as { errorInfo?: { code?: string } })?.errorInfo?.code
    if (code === "messaging/registration-token-not-registered") {
      await prisma.user.update({ where: { id: userId }, data: { pushToken: null } }).catch(() => {})
    }
  }
}
