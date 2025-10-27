import express from "express";
import { getPayPeriodSheets } from "../services/payPeriodService.js";

export const payPeriodSheetsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  // You may want to use authentication middleware in production
  const userId = req.body.userId;
  if (!userId || typeof userId !== "string") {
    return res.status(401).json({ error: "Unauthorized or missing userId" });
  }
  try {
    const payPeriodSheets = await getPayPeriodSheets(userId);
    res.setHeader("Cache-Control", "no-store");
    res.json(payPeriodSheets);
  } catch (error) {
    console.error("Error fetching pay period sheets:", error);
    let errorMessage = "Failed to fetch pay period sheets";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({ error: errorMessage });
  }
};
