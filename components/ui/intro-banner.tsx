// Figma "BTN/Box/Primary" 자기소개 작성 유도 배너 (node 743:5587 / 743:5951) — 자기소개를 하나도
// 작성하지 않은 유저에게 홈/마이페이지에서 노출되는 소프트 넛지로, 별도 서버 제약은 없다(호감/메시지 API는 막지 않음).
export default function IntroBanner({ onClick }: { onClick: () => void }) {
  return (
    <div className="mx-5 flex items-center gap-3 p-4 rounded-[4px] bg-[#f0ecfe]">
      <p className="flex-1 text-[14px] font-medium text-[#1f1f1f] tracking-[-0.14px] leading-[1.5]">
        자기소개를 작성해야 호감과 메시지를 보낼 수 있어요.
      </p>
      <button
        type="button"
        onClick={onClick}
        className="shrink-0 h-7 px-3 rounded-[4px] bg-[#2a2a2a] text-white text-[12px] font-medium active:opacity-80"
      >
        자기소개 작성
      </button>
    </div>
  )
}
