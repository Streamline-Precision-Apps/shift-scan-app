import { Router } from "express";
import notificationRoutes from "./notificationsRoute.js";
import blobRoutes from "./blobRoute.js";
import tokenRoutes from "./tokenRoutes.js";
import locationRoutes from "./locationRoutes.js";
import initRoutes from "./initRoutes.js";
import cookiesRoutes from "./cookiesRoutes.js";

const router = Router();

// all app routes
router.use("/v1", initRoutes);
router.use("/notifications", notificationRoutes);
router.use("/storage", blobRoutes);
router.use("/tokens", tokenRoutes);
router.use("/location", locationRoutes);
router.use("/cookies", cookiesRoutes);

export default router;
