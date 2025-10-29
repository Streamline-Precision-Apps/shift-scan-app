// server/src/controllers/jobsiteController.ts
import type { Request, Response } from "express";
import * as jobsiteService from "../services/jobsiteService.js";

export async function getJobsites(req: Request, res: Response) {
  try {
    const query = req.query;
    const jobsites = await jobsiteService.getJobsites(query);
    res.json(jobsites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobsites" });
  }
}

// Get a jobsite by QR code (for QR code uniqueness check)
export async function getJobsiteByQrId(req: Request, res: Response) {
  try {
    const { qrId } = req.params;
    if (!qrId) {
      return res.status(400).json({ error: "Invalid QR code" });
    }
    const jobsite = await jobsiteService.getJobsiteByQrId(qrId);
    if (!jobsite) {
      return res.status(200).json({
        available: true,
        message: "QR code is available and not in use.",
      });
    }
    res.json({ available: false, jobsite });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobsite by QR code" });
  }
}
// Get a jobsite by ID
export async function getJobsiteById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const jobsite = await jobsiteService.getJobsiteById(id);
    if (!jobsite) return res.status(404).json({ error: "Jobsite not found" });
    res.json(jobsite);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobsite" });
  }
}

// Create a jobsite
export async function createJobsite(req: Request, res: Response) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing jobsite data" });
    }
    console.log("Creating jobsite with data:", req.body);
    const jobsite = await jobsiteService.createJobsite(req.body);
    res.status(201).json(jobsite);
  } catch (error: any) {
    if (
      error instanceof Error &&
      error.message &&
      error.message.includes("already exists")
    ) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create jobsite" });
  }
}

// Update a jobsite
export async function updateJobsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Missing jobsite ID" });
    }
    const updated = await jobsiteService.updateJobsite(id, req.body);
    if (!updated) return res.status(404).json({ error: "Invalid ID" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update jobsite" });
  }
}

// Delete a jobsite
export async function deleteJobsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    const deleted = await jobsiteService.deleteJobsite(id);
    if (!deleted) return res.status(404).json({ error: "Jobsite not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete jobsite" });
  }
}
