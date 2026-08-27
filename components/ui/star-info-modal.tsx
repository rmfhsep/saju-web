import StarIcon from "@/components/ui/star-icon"

interface StarInfoModalProps {
  onClose: () => void
}

/**
 * 별 상점 대신 보여주는 안내 모달 (심사 대비 결제 기능 임시 비노출).
 * StarChip, "별 충전하기" 버튼 등 스토어로 이동하던 모든 진입점에서 재사용한다.
 *
 * TODO(심사 완료 후 제거): 결제 심사 끝나면 이 파일과 모든 사용처를 지우고,
 * 각 진입점의 onClick을 다시 () => router.push("/my/store")로 되돌릴 것.
 */
export default function StarInfoModal({ onClose }: StarInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      <div className="absolute inset-0 bg-black/61" onClick={onClose} />
      <div className="relative bg-white rounded-[8px] p-5 w-[312px] flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <StarIcon size={40} />
          <div className="flex flex-col gap-2">
            <p className="text-[16px] font-semibold text-[#1f1f1f] tracking-[-0.32px]">
              매일 출석하면 별 1개가 적립돼요
            </p>
            <p className="text-[15px] text-[#777] tracking-[-0.3px]">
              하루에 한 번, 앱에 접속하기만 해도
              <br />
              자동으로 적립돼요.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-[48px] rounded-[4px] text-[16px] font-semibold tracking-[-0.32px] bg-[#b6d0ff] text-[#1f1f1f] active:opacity-80"
        >
          확인
        </button>
      </div>
    </div>
  )
}
