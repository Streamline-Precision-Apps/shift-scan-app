// server/src/routes/jobsiteRoutes.ts
import { Router } from "express";
import {
  createJobsite,
  deleteJobsite,
  getJobsiteById,
  getJobsites,
  updateJobsite,
  getJobsiteByQrId,
} from "../controllers/jobsiteController.js";
const router = Router();

router.get("/qr/:qrId", getJobsiteByQrId);

router.get("/", getJobsites);

// Get a jobsite by ID
router.get("/:id", getJobsiteById);

// Create a jobsite
router.post("/", createJobsite);

// Update a jobsite
router.put("/:id", updateJobsite);

// Delete a jobsite
router.delete("/:id", deleteJobsite);

export default router;
