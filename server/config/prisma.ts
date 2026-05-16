import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // SQLite paths in Prisma schema are relative to the prisma folder.
  // In JS, they are relative to the CWD (root).
  // We force the path to be relative to the root for absolute consistency.
  let databaseUrl = process.env.DATABASE_URL || "file:./teamtask.db";
  
  if (databaseUrl.startsWith("file:./") && !databaseUrl.includes("/prisma/")) {
    // If it's the CLI-friendly relative path, adjust it for the JS client
    databaseUrl = databaseUrl.replace("file:./", "file:./prisma/");
  }
  
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
