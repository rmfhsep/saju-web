import { NextRequest, NextResponse } from 'next/server'

const OCTOMO_URL = 'https://api.octoverse.kr/octomo/v1/public/message/exists'
const OCTOMO_API_KEY = '124620d5e72355d24135866a0081b96d4fa3ddcdf594bb0bff7a7ebb5fc1b46f'

export async function POST(req: NextRequest) {
  const { mobileNum, text } = await req.json()

  if (!mobileNum || !text) {
    return NextResponse.json({ error: 'mobileNum and text are required' }, { status: 400 })
  }

  const res = await fetch(OCTOMO_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Octomo ${OCTOMO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mobileNum, text }),
  })

  const data = await res.json()
  return NextResponse.json(data)
}
