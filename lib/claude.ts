import Anthropic from "@anthropic-ai/sdk"
import { jsonrepair } from "jsonrepair"

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!_claude) {
    _claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _claude
}

/**
 * Claude 응답에서 텍스트를 추출한 뒤 JSON으로 파싱한다.
 * jsonrepair로 Claude가 생성하는 다양한 JSON 오류를 자동 수리:
 * - 마크다운 코드블록 (```json ... ```)
 * - 문자열 안 미이스케이프 따옴표·개행
 * - 트레일링 콤마
 * - 기타 경미한 구조 오류
 */
export function parseClaudeJson<T>(content: Anthropic.ContentBlock[]): T {
  const raw = content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("")
    .trim()

  // 첫 '{' 부터 마지막 '}' 까지 추출 (코드블록·전후 설명 제거)
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  const jsonSlice = start !== -1 && end > start ? raw.slice(start, end + 1) : raw

  // jsonrepair로 수리 후 파싱
  const repaired = jsonrepair(jsonSlice)
  return JSON.parse(repaired) as T
}
