import { Router } from "express";
import userRoutes from "./userRoutes.js";
import notificationRoutes from "./notificationsRoute.js";
import blobRoutes from "./blobRoute.js";
const router = Router();
// all app routes
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/storage", blobRoutes);
export default router;
//# sourceMappingURL=index.js.map