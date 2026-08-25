/** 마지막 글자 받침 유무에 따라 "을"/"를" 조사를 붙인다 — 한글이 아니면(영문 닉네임 등) "를"로 처리한다. */
export function withEulReul(word: string): string {
  const last = word.trim().at(-1)
  if (!last) return word
  const code = last.charCodeAt(0)
  if (code < 0xac00 || code > 0xd7a3) return `${word}를`
  const hasBatchim = (code - 0xac00) % 28 !== 0
  return `${word}${hasBatchim ? "을" : "를"}`
}
