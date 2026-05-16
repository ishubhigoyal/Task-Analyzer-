import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Ensure DATABASE_URL is set for SQLite if missing
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./app.db";
  }
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
