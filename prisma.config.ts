import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL은 pgbouncer 트랜잭션 모드 풀러(런타임 쿼리용)라 db push/migrate 같은
// 스키마 작업엔 못 쓴다(P1017로 끊김). DIRECT_URL(db.*.supabase.co)은 IPv6 전용이라
// 로컬 네트워크에서 아예 연결이 안 될 수 있다(P1001). 그래서 CLI는 같은 풀러 호스트를
// 세션 모드(5432, pgbouncer 파라미터 제거)로 바꿔 써서 DDL이 정상 동작하게 한다.
// 실제 앱 런타임은 lib/db.ts에서 DATABASE_URL로 별도 커넥션을 맺으므로 영향 없음.
function cliDatasourceUrl(): string | undefined {
  const raw = process.env["DATABASE_URL"]
  if (!raw) return undefined
  const url = new URL(raw)
  url.port = "5432"
  url.searchParams.delete("pgbouncer")
  return url.toString()
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: cliDatasourceUrl(),
  },
});
