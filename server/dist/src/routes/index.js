
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="57fd40e3-7446-55ef-a905-9d290cc082fe")}catch(e){}}();
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
//# sourceMappingURL=index.js.map
//# debugId=57fd40e3-7446-55ef-a905-9d290cc082fe
