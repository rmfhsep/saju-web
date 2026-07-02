import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    console.error("[prisma] DATABASE_URL 환경변수가 설정되어 있지 않습니다.")
    throw new Error("DATABASE_URL is not set")
  }
  try {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
    return new PrismaClient({ adapter } as never)
  } catch (err) {
    console.error("[prisma] PrismaClient 초기화 실패:", err)
    throw err
  }
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrisma()
  return globalForPrisma.prisma
}

// 모듈 import 시점이 아니라 실제 쿼리 시점에 초기화되도록 지연시켜,
// 초기화 실패가 라우트 핸들러의 try/catch에서 잡히고 로그로 남도록 함.
export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop, receiver) => Reflect.get(getPrisma() as object, prop, receiver),
}) as PrismaClient
