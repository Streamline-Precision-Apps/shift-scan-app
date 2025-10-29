// server/src/routes/equipmentRoutes.ts
import { Router } from "express";
import { getEquipment, getEquipmentByQrId, createEquipment, } from "../controllers/equipmentController.js";
const router = Router();
router.get("/qr/:qrId", getEquipmentByQrId);
router.get("/", getEquipment);
router.post("/", createEquipment);
export default router;
//# sourceMappingURL=equipmentRoute.js.map