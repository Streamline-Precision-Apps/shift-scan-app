/**
 * Parse an environment value into a number (seconds).
 * Supports:
 *  - plain numbers: "3600"
 *  - simple math expressions with digits and + - * / ( ) and spaces: "30 * 24 * 60 * 60"
 *  - unit suffixes: s (seconds), m (minutes), h (hours), d (days), w (weeks). Examples: "30d", "15m"
 *
 * The expression evaluator is guarded with a regex to only allow numeric characters and math operators.
 */
import parseEnvSeconds from "./tokenExpirationParser.js";
export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.POSTGRES_PRISMA_URL || "",
    jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
    jwtExpiration: parseEnvSeconds(process.env.JWT_EXPIRATION, 30 * 24 * 60 * 60), // seconds
};
export default config;
//# sourceMappingURL=config.js.map