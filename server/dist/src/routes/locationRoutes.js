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