
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9928576d-cd68-5152-bc40-303f2e90103e")}catch(e){}}();
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
//# sourceMappingURL=index.js.map
//# debugId=9928576d-cd68-5152-bc40-303f2e90103e
