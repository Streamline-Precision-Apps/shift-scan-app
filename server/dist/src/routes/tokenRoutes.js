import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { saveFCMToken } from "../controllers/tokenController.js";
const router = Router();
router.post("/fcm", verifyToken, saveFCMToken);
export default router;
//# sourceMappingURL=tokenRoutes.js.map