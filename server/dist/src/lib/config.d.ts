/**
 * Parse an environment value into a number (seconds).
 * Supports:
 *  - plain numbers: "3600"
 *  - simple math expressions with digits and + - * / ( ) and spaces: "30 * 24 * 60 * 60"
 *  - unit suffixes: s (seconds), m (minutes), h (hours), d (days), w (weeks). Examples: "30d", "15m"
 *
 * The expression evaluator is guarded with a regex to only allow numeric characters and math operators.
 */
export declare const config: {
    readonly port: string | 3001;
    readonly nodeEnv: string;
    readonly databaseUrl: string;
    readonly jwtSecret: string;
    readonly jwtExpiration: number;
};
export default config;
//# sourceMappingURL=config.d.ts.map