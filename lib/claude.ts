import Anthropic from "@anthropic-ai/sdk"

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!_claude) {
    _claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _claude
}

/**
 * JSON 문자열 안에 들어 있는 리터럴 개행문자를 이스케이프 시퀀스로 교체한다.
 * Claude가 "텍스트" 필드 안에 \n 대신 실제 줄바꿈을 넣는 케이스를 처리.
 */
function sanitizeJsonString(raw: string): string {
  let result = ""
  let inString = false
  let escaped = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]

    if (escaped) {
      result += ch
      escaped = false
      continue
    }
    if (ch === "\\") {
      result += ch
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      result += ch
      continue
    }
    // 문자열 안에 있는 제어 문자 → 이스케이프
    if (inString) {
      if (ch === "\n") { result += "\\n"; continue }
      if (ch === "\r") { result += "\\r"; continue }
      if (ch === "\t") { result += "\\t"; continue }
    }
    result += ch
  }
  return result
}

/**
 * Claude 응답에서 텍스트 블록만 이어붙여 JSON으로 파싱한다.
 * - 마크다운 코드블록(```json ... ```) 제거
 * - JSON 문자열 내 미이스케이프 개행 보정
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

  // 문자열 안 리터럴 개행 이스케이프 후 파싱
  return JSON.parse(sanitizeJsonString(jsonSlice)) as T
}
