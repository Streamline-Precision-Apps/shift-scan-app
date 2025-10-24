
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f42d3ac3-a4c5-55e4-9ad3-3aef5257e9e1")}catch(e){}}();
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { saveFCMToken } from "../controllers/tokenController.js";
const router = Router();
router.post("/fcm", verifyToken, saveFCMToken);
export default router;
//# sourceMappingURL=tokenRoutes.js.map
//# debugId=f42d3ac3-a4c5-55e4-9ad3-3aef5257e9e1
