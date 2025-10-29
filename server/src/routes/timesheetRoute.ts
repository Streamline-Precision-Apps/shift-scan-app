import { Router } from "express";
import { updateTimesheet } from "../controllers/timesheetController.js";

const router = Router();

// Update a timesheet
router.put("/:id", updateTimesheet);

export default router;
