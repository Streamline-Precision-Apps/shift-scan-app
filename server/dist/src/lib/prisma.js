
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ce47108c-6dc5-5d3b-af3e-f1459d181514")}catch(e){}}();
import { PrismaClient } from "../../generated/prisma/client.js";
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ["query", "error", "warn"],
    });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== "production")
    globalThis.prismaGlobal = prisma;
//# sourceMappingURL=prisma.js.map
//# debugId=ce47108c-6dc5-5d3b-af3e-f1459d181514
