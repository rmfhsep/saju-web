"use client"

import { useAppRouter } from "@/lib/useAppRouter"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import { useStarHistory } from "@/lib/queries/useStarHistory"

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}.${m}.${day}`
}

function HistorySkeletonRow() {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <div className="flex flex-col gap-1.5">
        <span className="h-[15px] w-[36px] rounded-[4px] bg-black/5 animate-pulse" />
        <span className="h-[12px] w-[70px] rounded-[4px] bg-black/5 animate-pulse" />
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="h-[16px] w-[40px] rounded-[4px] bg-black/5 animate-pulse" />
        <span className="h-[12px] w-[50px] rounded-[4px] bg-black/5 animate-pulse" />
      </div>
    </div>
  )
}

export default function StoreHistoryPage() {
  const router = useAppRouter()
  const historyQuery = useStarHistory()
  const items = historyQuery.data ?? []
  const loading = !historyQuery.data

  return (
    <Screen>
      <EditHeader title="이용 내역" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto px-5 pb-9">
        {loading ? (
          <div className="flex flex-col gap-4 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <HistorySkeletonRow />
                {i < 3 && <div className="h-px bg-[#eaebec]" />}
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="pt-1 text-[14px] font-normal text-[#777] tracking-[-0.14px]">
            아직 별 이용 내역이 없어요.
          </p>
        ) : (
          <div className="flex flex-col gap-4 pt-1">
            {items.map((item, i) => {
              const isCharge = item.type === "charge"
              return (
                <div key={i} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-medium text-[#1f1f1f] tracking-[-0.3px]">
                        {isCharge ? "충전" : "사용"}
                      </span>
                      <span className="text-[12px] font-normal text-[#949494]">{formatDate(item.createdAt)}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={`text-[16px] font-bold tracking-[-0.32px] ${
                          isCharge ? "text-[#ff9f00]" : "text-[#1f1f1f]"
                        }`}
                      >
                        {isCharge ? `+${item.amount}` : item.amount}
                      </span>
                      <span className="text-[12px] font-normal text-[#949494]">{item.balanceAfter}개</span>
                    </div>
                  </div>
                  {i < items.length - 1 && <div className="h-px bg-[#eaebec]" />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
