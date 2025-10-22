import { PrismaClient } from "../../generated/prisma/client.js";
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error', 'warn'],
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prisma;
//# sourceMappingURL=prisma.js.map