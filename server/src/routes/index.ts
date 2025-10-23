import { Router } from "express";
import userRoutes from "./userRoutes.js";
import notificationRoutes from "./notificationsRoute.js";
import blobRoutes from "./blobRoute.js";
import tokenRoutes from "./tokenRoutes.js";

const router = Router();

// all app routes

router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/storage", blobRoutes);
router.use("/tokens", tokenRoutes);

export default router;
