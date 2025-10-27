
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4aa417fb-3cdd-5dae-9b98-0247ef0dd97d")}catch(e){}}();
import express from "express";
import { getPayPeriodSheets } from "../services/payPeriodService.js";
export const payPeriodSheetsHandler = async (req, res) => {
    // You may want to use authentication middleware in production
    const userId = req.body.userId;
    if (!userId || typeof userId !== "string") {
        return res.status(401).json({ error: "Unauthorized or missing userId" });
    }
    try {
        const payPeriodSheets = await getPayPeriodSheets(userId);
        res.setHeader("Cache-Control", "no-store");
        res.json(payPeriodSheets);
    }
    catch (error) {
        console.error("Error fetching pay period sheets:", error);
        let errorMessage = "Failed to fetch pay period sheets";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ error: errorMessage });
    }
};
//# sourceMappingURL=payPeriodController.js.map
//# debugId=4aa417fb-3cdd-5dae-9b98-0247ef0dd97d
