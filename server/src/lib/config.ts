export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.POSTGRES_PRISMA_URL || "",
} as const;

export default config;
