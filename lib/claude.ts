import Anthropic from "@anthropic-ai/sdk"

const ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY_REMOVED"

let _claude: Anthropic | null = null

export function getClaude(): Anthropic {
  if (!_claude) {
    _claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
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
  return JSON.parse(text) as T
}
