import { Router } from "express";
import userRoutes from "./userRoutes.js";
import notificationRoutes from "./notificationsRoute.js";
import blobRoutes from "./blobRoute.js";
import tokenRoutes from "./tokenRoutes.js";
import locationRoutes from "./locationRoutes.js";
import initRoutes from "./initRoutes.js";

const router = Router();

// all app routes
router.use("/v1", initRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/storage", blobRoutes);
router.use("/tokens", tokenRoutes);
router.use("/location", locationRoutes);

export default router;
