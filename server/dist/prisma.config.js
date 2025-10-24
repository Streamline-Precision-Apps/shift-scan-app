// prisma.config.ts

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="5d1e9590-70a2-5655-87ec-182a76c24c25")}catch(e){}}();
import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";
export default defineConfig({
    schema: "prisma",
    migrations: {
        path: path.join("prisma", "migrations"),
        seed: 'ts-node -r tsconfig-paths/register --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
});
//# sourceMappingURL=prisma.config.js.map
//# debugId=5d1e9590-70a2-5655-87ec-182a76c24c25
