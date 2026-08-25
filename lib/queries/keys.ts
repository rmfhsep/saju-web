/**
 * TanStack Query 쿼리 키 레지스트리. 새 쿼리를 추가할 때 문자열 키를 직접 쓰지 말고
 * 여기에 추가해서 가져다 쓴다 — invalidateQueries가 여러 파일에서 같은 키를 참조해야
 * 정확히 동작하므로, 오타로 캐시가 갈라지는 걸 막기 위함이다.
 */
export const queryKeys = {
  me: ["me"] as const,
  discover: ["discover"] as const,
  userDetail: (id: number | string) => ["userDetail", String(id)] as const,
  likes: ["likes"] as const,
  conversations: ["conversations"] as const,
  starHistory: ["starHistory"] as const,
}
