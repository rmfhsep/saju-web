import Anthropic from "@anthropic-ai/sdk"

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!_claude) {
    _claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _claude
}

/** Claude 응답에서 텍스트 블록만 이어붙여 JSON으로 파싱한다. */
export function parseClaudeJson<T>(content: Anthropic.ContentBlock[]): T {
  const text = content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map(block => block.text)
    .join("")
    .trim()

  // 모델이 마크다운 코드블록이나 설명 텍스트를 함께 출력하는 경우를 대비해
  // 첫 '{'부터 마지막 '}'까지만 잘라내어 파싱한다.
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  const jsonSlice = start !== -1 && end !== -1 && end > start ? text.slice(start, end + 1) : text

  return JSON.parse(jsonSlice) as T
}
