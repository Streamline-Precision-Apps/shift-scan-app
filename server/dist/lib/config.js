
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4b933908-efe1-51de-ac2d-21799236f31d")}catch(e){}}();
export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.POSTGRES_PRISMA_URL || "",
};
export default config;
//# sourceMappingURL=config.js.map
//# debugId=4b933908-efe1-51de-ac2d-21799236f31d
