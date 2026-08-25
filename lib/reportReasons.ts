/** 신고 사유 목록(Figma "신고하기" 바텀시트 순서 그대로) — 클라이언트 라디오 목록과 서버 검증에 공용으로 쓴다. */
export const REPORT_REASONS = [
  "부적절한 사진",
  "허위 프로필 (사진 도용, AI 생성 등)",
  "욕설 및 비방",
  "사기 및 스팸",
  "불쾌한 메시지",
  "기타",
] as const

export type ReportReason = (typeof REPORT_REASONS)[number]

export const REPORT_REASON_OTHER: ReportReason = "기타"
