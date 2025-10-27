// server/src/services/payPeriodService.ts

!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="f4757968-a50f-5cdf-84d9-21caa90983bf")}catch(e){}}();
import prisma from "../lib/prisma.js";
// Utility to calculate the start date of the current pay period
export function calculatePayPeriodStart() {
    const startDate = new Date(2024, 7, 5); // August 5, 2024
    const now = new Date();
    const diffWeeks = Math.floor((now.getTime() - startDate.getTime()) / (2 * 7 * 24 * 60 * 60 * 1000)); // Two-week intervals
    return new Date(startDate.getTime() + diffWeeks * 2 * 7 * 24 * 60 * 60 * 1000);
}
export async function getPayPeriodSheets(userId) {
    const payPeriodStart = calculatePayPeriodStart();
    const currentDate = new Date();
    return prisma.timeSheet.findMany({
        where: {
            userId,
            startTime: {
                gte: payPeriodStart,
                lte: currentDate,
            },
            endTime: {
                not: null,
            },
        },
        select: {
            id: true,
            startTime: true,
            endTime: true,
        },
    });
}
//# sourceMappingURL=payPeriodService.js.map
//# debugId=f4757968-a50f-5cdf-84d9-21caa90983bf
