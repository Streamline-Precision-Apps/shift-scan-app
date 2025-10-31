import { Router } from "express";
import {
  updateTimesheet,
  getUserTimesheetsByDateController,
  getTimesheetDetailsManagerController,
  getManagerCrewTimesheetsController,
  approveTimesheetsBatchController,
  createTimesheetAndSwitchJobsController,
  getRecentTimesheetController,
  getTimesheetActiveStatusController,
  getBannerDataController,
} from "../controllers/timesheetController.js";

const router = Router();

// Batch approve timesheets
router.post("/approve-batch", approveTimesheetsBatchController);
//create a timesheet
router.post("/create", createTimesheetAndSwitchJobsController);
router.get("/user/:userId/recent", getRecentTimesheetController);
// Get active timesheet status for a user
router.get("/user/:userId/active-status", getTimesheetActiveStatusController);

// Update a timesheet
router.put("/:id", updateTimesheet);

// Update a timesheet
router.get("/:id/user/:userId", getBannerDataController);

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
