// server/src/controllers/equipmentController.ts
import type { Request, Response } from "express";
import * as equipmentService from "../services/equipmentService.js";

export async function getEquipment(req: Request, res: Response) {
  try {
    const equipment = await equipmentService.getEquipment(req.query);
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch equipment" });
  }
}
