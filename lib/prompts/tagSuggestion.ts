/**
 * prompt/maju_tag_prompt_spec.md 를 그대로 옮긴 Claude 호출 모듈.
 * 프로필 정보 + 연애 사주 수치(섹션1_연애기질.ai_tags)를 기반으로
 * 태그 풀 안에서 자기소개 추천 태그 8개(연애 성향 4 + 라이프스타일 4)를 받는다.
 */
import { getClaude, parseClaudeJson } from "@/lib/claude"

const MODEL = "claude-sonnet-4-6"

const SYSTEM_PROMPT = `당신은 데이팅앱 "마주"의 프로필 태그 추천 AI입니다.

유저의 프로필 정보와 연애 사주 수치를 종합적으로 읽고,
이 사람을 가장 자연스럽고 매력적으로 표현하는 태그를
태그 풀 안에서 추천하세요.

태그는 상대방이 이 사람을 처음 볼 때 읽게 되는 첫인상입니다.
정확하면서도 호감을 줄 수 있는 조합을 선택하세요.`

export interface TagSuggestionInput {
  purpose: string
  politics: string
  drink: string
  smoke: string
  express: number
  emotion: number
  lead: number
  attach: number
}

function buildUserPrompt(input: TagSuggestionInput): string {
  return `[유저 데이터]
연애 목적: ${input.purpose}
정치 성향: ${input.politics}
음주 빈도: ${input.drink}
흡연 여부: ${input.smoke}
표현방식: ${input.express}/100
감정깊이: ${input.emotion}/100
주도성: ${input.lead}/100
집착도: ${input.attach}/100

[태그 풀 — 연애 성향]
천천히 가까워지는 타입 / 빠르게 친해지는 타입 /
확신이 생기면 올인하는 타입 / 자연스러운 흐름을 따르는 타입 /
감정보다 행동으로 표현하는 타입 / 감정이 깊고 진지한 타입 /
설렘보다 안정을 중요하게 여기는 타입 / 밀당보다 솔직함을 선호하는 타입 /
혼자 있는 시간도 소중한 타입 / 같이 있을 때 가장 행복한 타입 /
표현은 서툴지만 마음은 깊은 타입 / 연애보다 우정처럼 쌓아가는 타입 /
한번 정하면 끝까지 가는 타입 / 설레는 순간을 소중히 여기는 타입

[태그 풀 — 라이프스타일]
진지한 만남을 원하는 타입 / 현재를 즐기는 타입 /
자연스러운 흐름을 따르는 타입 / 가치관이 뚜렷한 타입 /
조용한 일상을 선호하는 타입 / 활동적인 만남을 즐기는 타입 /
바쁘지만 만남에 진심인 타입 / 여유로운 삶을 추구하는 타입 /
나만의 루틴이 있는 타입 / 대화로 깊어지는 관계를 원하는 타입 /
함께 성장하고 싶은 타입 / 작은 것에서 행복을 찾는 타입 /
서로의 공간을 존중하는 타입 / 삶의 방향이 비슷한 사람을 찾는 타입

[규칙]
1. 반드시 태그 풀에 있는 태그만 사용
2. 연애 성향 4개 + 라이프스타일 4개, 총 8개
3. 아래 충돌 태그는 동시 선정 금지
   - 천천히 가까워지는 타입 ↔ 빠르게 친해지는 타입
   - 진지한 만남을 원하는 타입 ↔ 현재를 즐기는 타입
   - 조용한 일상을 선호하는 타입 ↔ 활동적인 만남을 즐기는 타입
   - 혼자 있는 시간도 소중한 타입 ↔ 같이 있을 때 가장 행복한 타입
   - 서로의 공간을 존중하는 타입 ↔ 같이 있을 때 가장 행복한 타입
4. JSON으로만 응답 (다른 텍스트 없이)

{"love":["태그1","태그2","태그3","태그4"],"life":["태그1","태그2","태그3","태그4"]}`
}

export interface TagSuggestion {
  love: string[]
  life: string[]
}

export async function generateTagSuggestion(input: TagSuggestionInput): Promise<TagSuggestion> {
  const response = await getClaude().messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(input) }],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    output_config: { format: { type: "json_object" } } as any,
  })
  return parseClaudeJson<TagSuggestion>(response.content)
}
