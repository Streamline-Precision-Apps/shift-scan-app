
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="ccf022bb-4855-5524-9643-da1a5baa4030")}catch(e){}}();
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUserLocations, getUserLocationHistory, postUserLocation, } from "../controllers/locationController.js";
const router = Router();
// Get latest location for authenticated user
router.get("/user", verifyToken, getUserLocations);
// Get latest location for any user (admin/manager)
router.get("/:userId", verifyToken, getUserLocations);
// Get location history for any user
router.get("/:userId/history", verifyToken, getUserLocationHistory);
// Post a new location log
router.post("/user", verifyToken, postUserLocation);
export default router;
//# sourceMappingURL=locationRoutes.js.map
//# debugId=ccf022bb-4855-5524-9643-da1a5baa4030
