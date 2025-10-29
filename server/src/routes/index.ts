import { Router } from "express";
import notificationRoutes from "./notificationsRoute.js";
import blobRoutes from "./blobRoute.js";
import tokenRoutes from "./tokenRoutes.js";
import locationRoutes from "./locationRoutes.js";
import initRoutes from "./initRoutes.js";
import cookiesRoutes from "./cookiesRoutes.js";
import equipmentRoutes from "./equipmentRoute.js";
import jobsiteRoutes from "./jobsiteRoute.js";
import formsRoutes from "./formsRoute.js";
import userRoutes from "./userRoute.js";

const router = Router();

// all app routes
router.use("/v1/forms", formsRoutes);
router.use("/v1/equipment", equipmentRoutes);
router.use("/v1/jobsite", jobsiteRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1", initRoutes);

router.use("/notifications", notificationRoutes);
router.use("/storage", blobRoutes);
router.use("/tokens", tokenRoutes);
router.use("/location", locationRoutes);
router.use("/cookies", cookiesRoutes);

export default router;
