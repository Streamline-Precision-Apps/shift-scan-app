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