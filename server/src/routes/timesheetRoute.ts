import { Router } from "express";
import {
  updateTimesheet,
  getUserTimesheetsByDateController,
  getTimesheetDetailsManagerController,
  getManagerCrewTimesheetsController,
  approveTimesheetsBatchController,
  createTimesheetAndSwitchJobsController,
} from "../controllers/timesheetController.js";
import { create } from "domain";

const router = Router();

// Batch approve timesheets
router.post("/approve-batch", approveTimesheetsBatchController);
//create a timesheet
router.post("/create", createTimesheetAndSwitchJobsController);

// Update a timesheet
router.put("/:id", updateTimesheet);
// Get timesheet details for manager editing
router.get("/:id/details", getTimesheetDetailsManagerController);
// Get timesheets for a user by userId and optional date
router.get("/user/:userId", getUserTimesheetsByDateController);

// Get all timesheets for all users in a manager's crew
router.get(
  "/manager/:managerId/crew-timesheets",
  getManagerCrewTimesheetsController
);

export default router;
