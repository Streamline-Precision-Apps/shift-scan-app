import { Router } from "express";
import userRoutes from "./userRoutes.js";
const router = Router();
// user routes
router.use("/users", userRoutes);
export default router;
//# sourceMappingURL=index.js.map