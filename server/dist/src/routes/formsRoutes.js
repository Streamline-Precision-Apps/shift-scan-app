
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="90e5920e-71b6-5787-84fe-8294146a1beb")}catch(e){}}();
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import formsController from "../controllers/formsController.js";
const router = Router();
// Form submission
router.post("/submission", verifyToken, formsController.createFormSubmission);
router.delete("/submission/:id", verifyToken, formsController.deleteFormSubmission);
// Drafts
router.post("/draft", verifyToken, formsController.saveDraft);
router.post("/draft-to-pending", verifyToken, formsController.saveDraftToPending);
router.post("/pending", verifyToken, formsController.savePending);
// Approvals
router.post("/approval", verifyToken, formsController.createFormApproval);
router.put("/approval/update", verifyToken, formsController.updateFormApproval);
module.exports = router;
//# sourceMappingURL=formsRoutes.js.map
//# debugId=90e5920e-71b6-5787-84fe-8294146a1beb
