import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

import {
  createFormApproval,
  createFormSubmission,
  deleteFormSubmission,
  getEmployeeRequests,
  getForms,
  getUserSubmissions,
  saveDraft,
  saveDraftToPending,
  savePending,
  updateFormApproval,
} from "../controllers/formsController.js";

const router = Router();
// Form submission
router.get("/forms", getForms);
router.post("/forms/submission", verifyToken, createFormSubmission);
router.delete("/forms/submission/:id", verifyToken, deleteFormSubmission);
router.get("/forms/:filter", verifyToken, getUserSubmissions);

// Drafts
router.post("/forms/draft", verifyToken, saveDraft);
router.post("/forms/draft-to-pending", verifyToken, saveDraftToPending);
router.post("/forms/pending", verifyToken, savePending);

// Approvals
router.get("/forms/employeeRequests/:filter", verifyToken, getEmployeeRequests);
router.post("/forms/approval", verifyToken, createFormApproval);
router.put("/forms/approval/update", verifyToken, updateFormApproval);

export default router;
