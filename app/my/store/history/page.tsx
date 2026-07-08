"use client"

import { useRouter } from "next/navigation"
import Screen from "@/components/ui/screen"
import EditHeader from "@/components/ui/edit-header"
import { STAR_HISTORY } from "@/lib/store"

export default function StoreHistoryPage() {
  const router = useRouter()
  const items = STAR_HISTORY

  return (
    <Screen>
      <EditHeader title="이용 내역" onBack={() => router.back()} />

      <div className="flex-1 scroll-area overflow-y-auto px-5">
        {items.length === 0 ? (
          <p className="pt-1 text-[14px] font-normal text-[#949494] tracking-[-0.14px]">
            아직 별 이용 내역이 없어요.
          </p>
        ) : (
          <div className="flex flex-col">
            {items.map((item, i) => {
              const isCharge = item.type === "charge"
              return (
                <div key={i} className="flex flex-col">
                  <div className="flex items-start justify-between py-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
                        {isCharge ? "충전" : "사용"}
                      </span>
                      <span className="text-[12px] font-normal text-[#949494]">{item.date}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={`text-[18px] font-bold tracking-[-0.36px] ${
                          isCharge ? "text-[#ff9f00]" : "text-[#1f1f1f]"
                        }`}
                      >
                        {isCharge ? `+${item.amount}` : item.amount}
                      </span>
                      <span className="text-[12px] font-normal text-[#949494]">{item.balance}개</span>
                    </div>
                  </div>
                  <div className="h-px bg-[#eaebec]" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Screen>
  )
}
