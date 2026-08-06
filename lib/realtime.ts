import { getSupabaseAdmin } from "@/lib/supabase"
import { chatRoomId } from "@/lib/chatRoom"

export type ChatBroadcastMessage = {
  id: number
  body: string
  createdAt: string
  fromUserId: number
  toUserId: number
}

/** 채팅방 채널로 이벤트를 브로드캐스트한다. 실시간 UX 보조용이라 실패해도 무시한다(호출부에서 .catch). */
async function broadcast(userIdA: number, userIdB: number, event: string, payload: Record<string, unknown>) {
  const channel = getSupabaseAdmin().channel(chatRoomId(userIdA, userIdB))
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
    await channel.send({ type: "broadcast", event, payload })
  } finally {
    await getSupabaseAdmin().removeChannel(channel)
  }
}

export async function broadcastNewMessage(message: ChatBroadcastMessage) {
  await broadcast(message.fromUserId, message.toUserId, "new-message", message)
}

/** readerId가 senderId로부터 온 메시지를 지금 시점까지 다 읽었음을 알린다. */
export async function broadcastMessagesRead(readerId: number, senderId: number, readAt: string) {
  await broadcast(readerId, senderId, "messages-read", { readerId, readAt })
}
