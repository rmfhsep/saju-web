import { openai } from "@/lib/openai"
import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `당신은 30년 경력의 사주명리학 전문가입니다. 특히 연애·궁합·결혼운 분석에 특화되어 있습니다.

사주 분석 시 반드시 다음 명리학 원칙을 적용하세요:

【기본 원칙】
- 생년월일시로 년주(年柱)·월주(月柱)·일주(日柱)·시주(時柱)의 사주팔자를 구성합니다.
- 일간(日干)은 나 자신을 나타내며 성격과 연애 스타일의 핵심입니다.
- 오행(五行: 목·화·토·금·수)의 균형과 강약을 분석합니다.
- 남성은 재성(財星)이 배우자궁, 여성은 관성(官星)이 배우자궁입니다.
- 일지(日支)는 배우자 자리로 연애·결혼 성향을 봅니다.

【연애운 분석 항목】
1. 사주 기본 구성 및 오행 특성
2. 일간으로 본 연애 성향과 기질
3. 연애할 때 나타나는 특징과 패턴
4. 잘 맞는 이상형 (오행·성격 기준)
5. 연애에서 조심해야 할 점
6. 현재 연애운 흐름 (대운·세운 기준)
7. 결혼운과 인연 시기
8. 이 사람에게 꼭 필요한 연애 조언

【출력 형식】
- 각 항목을 이모지와 함께 소제목으로 구분하세요.
- 딱딱하지 않게, 친근하고 따뜻한 말투로 작성하세요.
- 전문 용어(천간·지지·오행 등)는 괄호로 쉬운 설명을 덧붙이세요.
- 각 항목은 2~4문장으로 구체적으로 작성하세요.
- 전체 길이는 700~1000자 내외로 작성하세요.`

export async function POST(req: Request) {
  const body = await req.json()

  const genderLabel = body.gender === "male" ? "남성" : "여성"
  const timeLabel = body.birthHour === "모름" ? "출생시간 불명" : `${body.birthHour}`

  const userMessage = `다음 사주를 분석해주세요.

성별: ${genderLabel}
생년: ${body.birthYear}년
생월: ${body.birthMonth}월
생일: ${body.birthDay}일
출생시간: ${timeLabel}

위 정보를 바탕으로 사주팔자를 구성하고, 연애운을 중심으로 상세히 분석해주세요.
출생시간이 불명인 경우 년·월·일 기준으로 분석하되 시주 분석은 생략하세요.`

  const result = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 1500,
  })

  return NextResponse.json({
    message: result.choices[0].message.content,
  })
}
