import { getSupabaseAdmin } from "@/lib/supabase"
import { chatRoomId } from "@/lib/chatRoom"

export type ChatBroadcastMessage = {
  id: number
  body: string
  createdAt: string
  fromUserId: number
  toUserId: number
}

/** 새 메시지를 두 유저의 채팅방 채널로 브로드캐스트한다. 실시간 UX 보조용이라 실패해도 무시한다. */
export async function broadcastNewMessage(message: ChatBroadcastMessage) {
  const channel = getSupabaseAdmin().channel(chatRoomId(message.fromUserId, message.toUserId))
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("realtime subscribe timeout")), 5000)
      channel.subscribe(status => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout)
          resolve()
        }
        if (status === "CHANNEL_ERROR" || status === "CLOSED" || status === "TIMED_OUT") {
          clearTimeout(timeout)
          reject(new Error(`realtime subscribe failed: ${status}`))
        }
      })
    })
    await channel.send({ type: "broadcast", event: "new-message", payload: message })
  } finally {
    await getSupabaseAdmin().removeChannel(channel)
  }
}
