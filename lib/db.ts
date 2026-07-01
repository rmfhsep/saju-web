import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const DATABASE_URL = "DATABASE_URL_REMOVED"

function createPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter } as never)
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
