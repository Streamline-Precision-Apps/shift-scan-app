
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="db7837a8-fe75-5f2a-915e-0b43311fc56e")}catch(e){}}();
import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const router = Router();
// Returns a token for use with Swagger UI. In production this endpoint is disabled.
router.get("/", (req, res) => {
    if (process.env.NODE_ENV === "production") {
        return res
            .status(403)
            .json({ error: "Not allowed in production environment" });
    }
    // If an explicit token is configured for swagger, return it (convenience)
    const configured = process.env.SWAGGER_BEARER_TOKEN;
    if (configured) {
        return res.json({ token: configured });
    }
    // Otherwise sign a short-lived JWT for a fake/dev user using JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res
            .status(500)
            .json({ error: "JWT_SECRET not configured; cannot create token" });
    }
    const payload = { sub: "swagger-dev", name: "Swagger Dev Token", roles: ["admin"] };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: "24h" });
    return res.json({ token });
});
export default router;
//# sourceMappingURL=swaggerTokenRoutes.js.map
//# debugId=db7837a8-fe75-5f2a-915e-0b43311fc56e
