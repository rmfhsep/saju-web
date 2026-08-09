import Image from "next/image"
import RadioOnIcon from "@/public/icons/Radio_on.svg"
import RadioOffIcon from "@/public/icons/Radio_off.svg"

interface RadioOptionProps {
  label: string
  selected: boolean
  onClick: () => void
}

// 디자인 시스템 Selected Button(30-731) / Radio(30-719, 28-5112) 기준
// selected: bg Light Blue Light(#E9F1FF) / border Light Blue Strong(#B6D0FF) / radio Gray850(#1F1F1F)
// default : bg Navy50(#F7F7F8) / border transparent / radio Navy200(#E1E2E4)
export default function RadioOption({ label, selected, onClick }: RadioOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 h-[48px] rounded-[4px] transition-colors ${
        selected ? "bg-[#e9f1ff] border border-[#b6d0ff]" : "bg-[#f7f7f8] border border-transparent"
      }`}
    >
      <Image
        src={selected ? RadioOnIcon : RadioOffIcon}
        alt=""
        width={20}
        height={20}
        className="shrink-0"
      />
      <span className={`${selected ? "text-body1Medium text-[#0f0f10]" : "text-body1Medium text-[#777777]"}`}>
        {label}
      </span>
    </button>
  )
}
