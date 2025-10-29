// server/src/routes/equipmentRoutes.ts
import { Router } from "express";
import { getEquipment } from "../controllers/equipmentController.js";
const router = Router();

router.get("/", getEquipment);

export default router;
