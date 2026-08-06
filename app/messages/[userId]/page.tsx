"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { decodeJwt } from "jose"
import Screen from "@/components/ui/screen"
import BackButton from "@/components/ui/back-button"
import PageFooter from "@/components/ui/page-footer"
import { getSupabaseClient } from "@/lib/supabaseClient"
import { chatRoomId } from "@/lib/chatRoom"

type ThreadMessage = {
  id: number | string
  body: string
  createdAt: string
  fromMe: boolean
  status?: "sending" | "failed"
}
type ThreadUser = { id: number; nickname: string | null; name: string | null; photos: string | null }

export default function MessageThreadPage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()

  const [user, setUser] = useState<ThreadUser | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  function load() {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    fetch(`/api/messages/${params.userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!d) return
        setUser(d.user)
        setMessages(d.messages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [messages.length])

  // 상대가 보낸 메시지를 실시간으로 받는다 (Supabase Realtime broadcast).
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    const counterpartId = Number(params.userId)
    if (!Number.isFinite(counterpartId)) return

    let myId: number
    try {
      myId = (decodeJwt(token) as { userId: number }).userId
    } catch {
      return
    }

    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(chatRoomId(myId, counterpartId))
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        const msg = payload as { id: number; body: string; createdAt: string; fromUserId: number; toUserId: number }
        if (msg.fromUserId !== counterpartId) return
        setMessages(prev => (prev.some(m => m.id === msg.id) ? prev : [...prev, { id: msg.id, body: msg.body, createdAt: msg.createdAt, fromMe: false }]))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.userId])

  async function sendMessage(body: string, tempId: string) {
    setSending(true)
    setError(null)
    const token = localStorage.getItem("auth_token")
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ toUserId: Number(params.userId), body }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error === "insufficient stars" ? "별이 부족해요. 별을 충전하고 다시 시도해주세요." : "메시지 전송에 실패했어요.")
        setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: "failed" } : m)))
        return
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === tempId
            ? { id: data.message.id, body: data.message.body, createdAt: data.message.createdAt, fromMe: true }
            : m,
        ),
      )
    } catch {
      setError("메시지 전송에 실패했어요.")
      setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, status: "failed" } : m)))
    } finally {
      setSending(false)
    }
  }

  function handleSend() {
    const body = text.trim()
    if (!body || sending) return
    const tempId = `temp-${Date.now()}`
    setMessages(prev => [...prev, { id: tempId, body, createdAt: new Date().toISOString(), fromMe: true, status: "sending" }])
    setText("")
    sendMessage(body, tempId)
  }

  function handleRetry(m: ThreadMessage) {
    if (sending) return
    setMessages(prev => prev.map(x => (x.id === m.id ? { ...x, status: "sending" } : x)))
    sendMessage(m.body, m.id as string)
  }

  const displayName = user?.nickname || user?.name || ""

  return (
    <Screen>
      <div className="h-[52px] flex items-center gap-3 px-5 py-3.5 shrink-0 border-b border-[#f4f4f5]">
        <BackButton onClick={() => router.back()} />
        <button
          type="button"
          onClick={() => user && router.push(`/recommend/${user.id}`)}
          className="text-[18px] font-semibold text-[#1f1f1f] tracking-[-0.36px]"
        >
          {displayName}
        </button>
      </div>

      <div className="flex-1 scroll-area overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#b6d0ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.fromMe ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-[16px] text-[15px] leading-[1.4] tracking-[-0.3px] whitespace-pre-wrap ${
                  m.fromMe ? "bg-[#b6d0ff] text-[#1f1f1f] rounded-br-[4px]" : "bg-[#f4f4f5] text-[#1f1f1f] rounded-bl-[4px]"
                } ${m.status === "sending" ? "opacity-50" : ""} ${m.status === "failed" ? "opacity-60" : ""}`}
              >
                {m.body}
              </div>
              {m.status === "failed" && (
                <button
                  type="button"
                  onClick={() => handleRetry(m)}
                  className="text-[12px] text-[#ff334b] mt-0.5"
                >
                  전송 실패 · 탭하여 다시 보내기
                </button>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <PageFooter className="px-5 pb-4 flex flex-col gap-2">
        {error && <p className="text-[13px] text-[#ff334b]">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 500))}
            placeholder="메시지를 입력하세요"
            rows={1}
            className="flex-1 max-h-[100px] px-4 py-3 rounded-[20px] border border-[#dbdcdf] text-[15px] tracking-[-0.3px] placeholder:text-[#b7b7b7] outline-none resize-none focus:border-[#90b7ff]"
          />
          <button
            type="button"
            disabled={!text.trim() || sending}
            onClick={handleSend}
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40"
            style={{ backgroundColor: "#1f1f1f" }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h14M11 4l6 6-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </PageFooter>
    </Screen>
  )
}
