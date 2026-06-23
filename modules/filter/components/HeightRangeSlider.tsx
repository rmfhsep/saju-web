interface Props {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}

const THUMB_CLASS =
  "absolute w-full h-[24px] top-0 appearance-none bg-transparent pointer-events-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1a73e8] " +
  "[&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none " +
  "[&::-moz-range-thumb]:w-[20px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1a73e8]"

export default function HeightRangeSlider({ min, max, valueMin, valueMax, onChange }: Props) {
  const pctMin = ((valueMin - min) / (max - min)) * 100
  const pctMax = ((valueMax - min) / (max - min)) * 100

  return (
    <div className="relative h-[24px]">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full bg-[#e5e5e5]" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-[4px] rounded-full bg-[#1a73e8]"
        style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={e => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
        className={THUMB_CLASS}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={e => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
        className={THUMB_CLASS}
      />
    </div>
  )
}
