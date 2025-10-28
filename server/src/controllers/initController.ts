import express from "express";
import dotenv from "dotenv";
import { getUserWithSettingsById } from "../services/initService.js";

dotenv.config();

export const initHandler = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.body.userId as string;
  const token = req.body.token as string;
  console.log("[initHandler] Received userId:", userId, "token:", token);

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const data = await getUserWithSettingsById(userId);
    if (!data.user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
};
