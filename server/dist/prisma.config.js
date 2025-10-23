// prisma.config.ts
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