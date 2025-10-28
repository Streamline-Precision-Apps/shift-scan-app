
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="9aa33296-c6b3-5873-8f12-f888acc4c771")}catch(e){}}();
import express from "express";
import dotenv from "dotenv";
import { getUserWithSettingsById } from "../services/initService.js";
dotenv.config();
export const initHandler = async (req, res) => {
    const userId = req.body.userId;
    const token = req.body.token;
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
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: String(err) });
    }
};
//# sourceMappingURL=initController.js.map
//# debugId=9aa33296-c6b3-5873-8f12-f888acc4c771
