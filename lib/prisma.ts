import { PrismaClient } from "@prisma/client";

// Caching the Prisma client in globalThis helps prevent multiple connections
// in Next.js development environment, which can lead to connection exhaustion.
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
