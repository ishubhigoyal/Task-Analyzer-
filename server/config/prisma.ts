import { PrismaClient } from "@prisma/client";
import path from "path";

const prismaClientSingleton = () => {
  // Use an absolute path to ensure JS client finds the DB in the prisma folder
  // relative to the process root.
  const dbPath = path.resolve(process.cwd(), "prisma/teamtask.db");
  const databaseUrl = `file:${dbPath}`;
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
