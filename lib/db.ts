import { PrismaClient } from "@prisma/client"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Database = require("better-sqlite3")
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient {
  const dbPath = path.resolve(process.cwd(), "prisma/dev.db")
  const db = new Database(dbPath)
  const adapter = new PrismaBetterSqlite3(db)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
