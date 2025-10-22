import { PrismaClient } from "../../generated/prisma/client.js";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
