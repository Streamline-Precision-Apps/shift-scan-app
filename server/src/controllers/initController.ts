import express from "express";
import dotenv from "dotenv";
import { getUserWithSettingsById } from "../services/initService.js";

dotenv.config();

export const initHandler = async (
  req: express.Request,
  res: express.Response
) => {
  const userId = req.body.userId as string;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const user = await getUserWithSettingsById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: String(err) });
  }
};
