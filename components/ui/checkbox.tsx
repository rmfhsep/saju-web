interface CheckboxProps {
  checked: boolean
  onChange: () => void
}

// 디자인 시스템 Control/Checkbox(28:5111) 기준
export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onChange() }}
      className="w-[20px] h-[20px] shrink-0 flex items-center justify-center"
    >
      {checked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M1 5C1 2.79086 2.79086 1 5 1H15C17.2091 1 19 2.79086 19 5V15C19 17.2091 17.2091 19 15 19H5C2.79086 19 1 17.2091 1 15V5Z" fill="#B6D0FF" />
          <path d="M6.25 10L8.75 12.5L13.75 7.5" stroke="#1F1F1F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 1.5H15C16.933 1.5 18.5 3.067 18.5 5V15C18.5 16.933 16.933 18.5 15 18.5H5C3.067 18.5 1.5 16.933 1.5 15V5C1.5 3.067 3.067 1.5 5 1.5Z" stroke="#E1E2E4" />
        </svg>
      )}
    </button>
  )
}
