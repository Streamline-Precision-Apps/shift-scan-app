
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="52efff44-22d9-5e0e-9e99-6f50403143b2")}catch(e){}}();
import { Router } from "express";
import { initHandler } from "../controllers/initController.js";
const router = Router();
// Define your init routes here
router.post("/init", initHandler);
export default router;
//# sourceMappingURL=initRoutes.js.map
//# debugId=52efff44-22d9-5e0e-9e99-6f50403143b2
