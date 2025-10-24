
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="64c640ba-ad05-5e0e-8443-9335b95d00f0")}catch(e){}}();
export function requireFirebaseEnv(req, res, next) {
    const requiredEnvVars = [
        "FIREBASE_SERVICE_JSON_PROJECT_ID",
        "FIREBASE_SERVICE_JSON_CLIENT_EMAIL",
        "FIREBASE_SERVICE_JSON_PRIVATE_KEY",
    ];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn("[send-notification] ⚠️ Firebase not configured properly. Missing:", missingVars);
        return res.status(200).json({
            success: false,
            error: "Firebase notification service not configured",
            details: `Missing environment variables: ${missingVars.join(", ")}`,
        });
    }
    next();
}
//# sourceMappingURL=requireFirebaseEnv.js.map
//# debugId=64c640ba-ad05-5e0e-8443-9335b95d00f0
