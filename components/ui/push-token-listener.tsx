"use client"

import { useEffect } from "react"
import { onPushTokenReceived } from "@/lib/bridge"

/**
 * 네이티브가 FCM 디바이스 토큰을 보내오면 서버에 등록한다.
 * 로그인 전(토큰 없음)에는 조용히 무시하고, 다음 수신 때 다시 시도한다.
 */
export default function PushTokenListener() {
  useEffect(() => {
    onPushTokenReceived(token => {
      const authToken = localStorage.getItem("auth_token")
      if (!authToken) return
      fetch("/api/push/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ token }),
      }).catch(() => {})
    })
  }, [])

  return null
}
