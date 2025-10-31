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
  getDashboardLogsController,
  getClockOutCommentController,
  getUserEquipmentLogsController,
  getUserRecentJobsiteDetailsController,
  createEmployeeEquipmentLogController,
  getEmployeeEquipmentLogDetailsController,
  deleteEmployeeEquipmentLogController,
  updateEmployeeEquipmentLogController,
} from "../controllers/timesheetController.js";

const router = Router();

// Batch approve timesheets
router.post("/approve-batch", approveTimesheetsBatchController);
//create a timesheet
router.post("/create", createTimesheetAndSwitchJobsController);
router.get("/user/:userId/recent", getRecentTimesheetController);
// Get active timesheet status for a user
router.get("/user/:userId/active-status", getTimesheetActiveStatusController);
// Get dashboard logs for a user
router.get("/user/:userId/dashboard-logs", getDashboardLogsController);
router.get("/user/:userId/clockOutComment", getClockOutCommentController);
// Update a timesheet
router.put("/:id", updateTimesheet);

// Update a timesheet
router.get("/:id/user/:userId", getBannerDataController);

// Get timesheet details for manager editing
router.get("/:id/details", getTimesheetDetailsManagerController);
// Get timesheets for a user by userId and optional date
router.get("/user/:userId", getUserTimesheetsByDateController);

router.get("/user/:userId/equipmentLogs", getUserEquipmentLogsController);

router.get(
  "/user/:userId/recentJobDetails",
  getUserRecentJobsiteDetailsController
);

// Create a new employee equipment log
router.post("/equipment-log", createEmployeeEquipmentLogController);

// Get details of a specific employee equipment log by logId
router.get("/equipment-log/:logId", getEmployeeEquipmentLogDetailsController);
router.delete("/equipment-log/:logId", deleteEmployeeEquipmentLogController);

// Update an employee equipment log
router.put("/equipment-log/:logId", updateEmployeeEquipmentLogController);

// Get all timesheets for all users in a manager's crew
router.get(
  "/manager/:managerId/crew-timesheets",
  getManagerCrewTimesheetsController
);

export default router;
