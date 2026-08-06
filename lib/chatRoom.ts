/** 두 유저 id로 결정적인(정렬된) Realtime 채널 이름을 만든다. 서버/클라이언트 양쪽에서 공유. */
export function chatRoomId(userIdA: number, userIdB: number): string {
  const [a, b] = [userIdA, userIdB].sort((x, y) => x - y)
  return `chat-${a}-${b}`
}
