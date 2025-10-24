
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="7a6e36f3-4269-55b8-ba68-d6cad3042217")}catch(e){}}();
import { Router } from "express";
import userRoutes from "./userRoutes.js";
const router = Router();
// API health check
router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
    });
});
// Mount routes
router.use("/users", userRoutes);
export default router;
//# sourceMappingURL=index.js.map
//# debugId=7a6e36f3-4269-55b8-ba68-d6cad3042217
