import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createFormApproval, createFormSubmission, deleteFormSubmission, getEmployeeRequests, getForms, getUserSubmissions, saveDraft, saveDraftToPending, savePending, updateFormApproval, getFormDraft, getTeamSubmission, getFormSubmission, getManagerFormApproval, getFormTemplate, } from "../controllers/formsController.js";
const router = Router();
// Submission type-specific GET routes
router.get("/formDraft/:id", verifyToken, getFormDraft);
router.get("/teamSubmission/:id", verifyToken, getTeamSubmission);
router.get("/formSubmission/:id", verifyToken, getFormSubmission);
router.get("/managerFormApproval/:id", verifyToken, getManagerFormApproval);
router.get("/form/:id", verifyToken, getFormTemplate);
// Form submission
router.get("/", getForms);
router.post("/submission", verifyToken, createFormSubmission);
router.delete("/submission/:id", verifyToken, deleteFormSubmission);
router.get("/:filter", verifyToken, getUserSubmissions);
// Drafts
router.post("/draft", verifyToken, saveDraft);
router.post("/draft-to-pending", verifyToken, saveDraftToPending);
router.post("/pending", verifyToken, savePending);
// Approvals
router.get("/employeeRequests/:filter", verifyToken, getEmployeeRequests);
router.post("/approval", verifyToken, createFormApproval);
router.put("/approval/update", verifyToken, updateFormApproval);
export default router;
//# sourceMappingURL=formsRoute.js.map