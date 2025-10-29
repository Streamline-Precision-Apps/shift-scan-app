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