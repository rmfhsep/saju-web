import OpenAI from "openai"

const OPENAI_API_KEY = "OPENAI_API_KEY_REMOVED"

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  }
  return _openai
}
