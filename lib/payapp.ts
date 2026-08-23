/**
 * PayApp(페이앱) 결제 연동 모듈 — 서버 전용.
 * 문서: https://docs.payapp.kr/dev_center01.html
 *
 * 사용 예:
 *   import { requestPayment, verifyFeedback, PAY_STATE } from "@/lib/payapp"
 */

const PAYAPP_API_URL = "https://api.payapp.kr/oapi/apiLoad.html"

/** pay_state 코드 — feedbackurl 콜백에서 전달됨. */
export const PAY_STATE = {
  REQUESTED: 1,
  COMPLETED: 4,
  CANCEL_REQUESTED: [8, 32],
  CANCEL_APPROVED: [9, 64],
} as const

export function isCompleted(state: number) {
  return state === PAY_STATE.COMPLETED
}
export function isCancelRequested(state: number): boolean {
  return (PAY_STATE.CANCEL_REQUESTED as readonly number[]).includes(state)
}
export function isCancelApproved(state: number): boolean {
  return (PAY_STATE.CANCEL_APPROVED as readonly number[]).includes(state)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} 환경변수가 설정되어 있지 않습니다.`)
  return value
}

/** payrequest에는 userid만 필요, paycancel/paycancelreq에는 linkkey도 필요 (페이앱 문서 기준). */
function payappUserId(): string {
  return requireEnv("PAYAPP_USERID")
}
function payappLinkKey(): string {
  return requireEnv("PAYAPP_LINKKEY")
}
function payappLinkVal(): string {
  return requireEnv("PAYAPP_LINKVAL")
}

async function postToPayApp(fields: Record<string, string | number | undefined>): Promise<Record<string, string>> {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === "") continue
    body.set(key, String(value))
  }

  const res = await fetch(PAYAPP_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body,
  })
  const text = await res.text()
  return Object.fromEntries(new URLSearchParams(text))
}

export type RequestPaymentParams = {
  /** 상품명 */
  goodname: string
  /** 결제 금액 (최소 1,000원) */
  price: number
  /** 수신 휴대폰번호 (SMS 미발송 시에도 필수 파라미터) */
  recvphone: string
  /** 결제요청 메모 */
  memo?: string
  /** SMS 발송 여부 — "n"으로 주면 SMS 미발송 (앱 내에서 바로 payurl로 결제창을 띄울 때 사용) */
  smsuse?: "n"
  /** 결제완료 콜백을 받을 URL. 비우면 PAYAPP_FEEDBACK_URL 환경변수를 사용 */
  feedbackurl?: string
  /** 결제완료 후 사용자를 이동시킬 URL */
  returnurl?: string
  /** 결제수단 제한 (예: "card,kakaopay,naverpay") */
  openpaytype?: string
  /** 임의변수 — 콜백에 그대로 되돌아옴 (예: 내부 주문 식별자) */
  var1?: string
  var2?: string
}

export type RequestPaymentResult = {
  ok: boolean
  mulNo: string
  payurl: string
  qrurl: string
  errorMessage: string
  raw: Record<string, string>
}

/** cmd=payrequest — 결제 요청을 생성하고 결제창 URL(payurl)을 발급받는다. */
export async function requestPayment(params: RequestPaymentParams): Promise<RequestPaymentResult> {
  const feedbackurl = params.feedbackurl ?? process.env.PAYAPP_FEEDBACK_URL
  const raw = await postToPayApp({
    cmd: "payrequest",
    userid: payappUserId(),
    goodname: params.goodname,
    price: params.price,
    recvphone: params.recvphone,
    memo: params.memo,
    smsuse: params.smsuse,
    feedbackurl,
    returnurl: params.returnurl,
    openpaytype: params.openpaytype,
    var1: params.var1,
    var2: params.var2,
  })

  return {
    ok: raw.state === "1",
    mulNo: raw.mul_no ?? "",
    payurl: raw.payurl ?? "",
    qrurl: raw.qrurl ?? "",
    errorMessage: raw.errorMessage ?? "",
    raw,
  }
}

export type CancelPaymentParams = {
  /** PayApp 결제요청번호 */
  mulNo: string
  /** 결제요청취소 메모 */
  cancelMemo: string
  /** "ready"로 주면 결제 승인 전(요청 상태)만 취소 가능 */
  cancelMode?: "ready"
  /** 부분취소 여부 */
  partCancel?: boolean
  /** 부분취소 금액 — partCancel=true일 때 필수 */
  cancelPrice?: number
}

export type CancelPaymentResult = {
  ok: boolean
  errorMessage: string
  raw: Record<string, string>
}

/** cmd=paycancel — 결제 요청/승인 건을 즉시 취소한다. */
export async function cancelPayment(params: CancelPaymentParams): Promise<CancelPaymentResult> {
  const raw = await postToPayApp({
    cmd: "paycancel",
    userid: payappUserId(),
    linkkey: payappLinkKey(),
    mul_no: params.mulNo,
    cancelmemo: params.cancelMemo,
    cancelmode: params.cancelMode,
    partcancel: params.partCancel ? 1 : undefined,
    cancelprice: params.cancelPrice,
  })
  return { ok: raw.state === "1", errorMessage: raw.errorMessage ?? "", raw }
}

export type RequestCancelPaymentResult = {
  ok: boolean
  errorMessage: string
  paybackPrice: string
  raw: Record<string, string>
}

/** cmd=paycancelreq — 구매자 동의가 필요한 취소요청을 보낸다 (즉시 취소가 아닌 취소 절차 시작). */
export async function requestCancelPayment(params: {
  mulNo: string
  cancelMemo: string
}): Promise<RequestCancelPaymentResult> {
  const raw = await postToPayApp({
    cmd: "paycancelreq",
    userid: payappUserId(),
    linkkey: payappLinkKey(),
    mul_no: params.mulNo,
    cancelmemo: params.cancelMemo,
  })
  return {
    ok: raw.state === "1",
    errorMessage: raw.errorMessage ?? "",
    paybackPrice: raw.paybackprice ?? "",
    raw,
  }
}

export type PayAppFeedback = {
  mulNo: string
  goodname: string
  price: number
  state: number
  payDate: string
  var1: string
  var2: string
  raw: Record<string, string>
}

/**
 * feedbackurl로 들어온 요청 본문(form-urlencoded)을 검증한다.
 * linkkey/linkval이 우리 계정 값과 일치하지 않으면 null을 반환한다 — 위조된 콜백이므로 무시할 것.
 */
export function verifyFeedback(fields: Record<string, string>): PayAppFeedback | null {
  if (fields.linkkey !== payappLinkKey() || fields.linkval !== payappLinkVal()) {
    return null
  }
  return {
    mulNo: fields.mul_no ?? "",
    goodname: fields.goodname ?? "",
    price: Number(fields.price ?? 0),
    state: Number(fields.pay_state ?? 0),
    payDate: fields.pay_date ?? "",
    var1: fields.var1 ?? "",
    var2: fields.var2 ?? "",
    raw: fields,
  }
}
