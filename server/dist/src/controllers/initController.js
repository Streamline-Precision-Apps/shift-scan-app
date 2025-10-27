
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b0d53eb0-35f9-59c5-bb31-854f938059f5")}catch(e){}}();
import express from "express";
import dotenv from "dotenv";
import { getUserWithSettingsById } from "../services/initService.js";
dotenv.config();
export const initHandler = async (req, res) => {
    const userId = req.body.userId;
    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }
    try {
        const user = await getUserWithSettingsById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user });
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: String(err) });
    }
};
//# sourceMappingURL=initController.js.map
//# debugId=b0d53eb0-35f9-59c5-bb31-854f938059f5
