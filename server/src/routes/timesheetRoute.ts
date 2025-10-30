import { Router } from "express";
import {
  updateTimesheet,
  getUserTimesheetsByDateController,
  getTimesheetDetailsManagerController,
} from "../controllers/timesheetController.js";

const router = Router();

// Update a timesheet
router.put("/:id", updateTimesheet);
// Get timesheet details for manager editing
router.get("/:id/details", getTimesheetDetailsManagerController);
// Get timesheets for a user by userId and optional date
router.get("/user/:userId", getUserTimesheetsByDateController);

export default router;
