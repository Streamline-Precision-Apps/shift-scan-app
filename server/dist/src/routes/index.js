import { Router } from "express";
import userRoutes from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
import swaggerTokenRoutes from "./swaggerTokenRoutes.js";
const router = Router();
// auth routes
router.use("/auth", authRoutes);
// user routes
router.use("/users", userRoutes);
// dev-only swagger token route: /api/swagger-token
router.use("/swagger-token", swaggerTokenRoutes);
export default router;
//# sourceMappingURL=index.js.map