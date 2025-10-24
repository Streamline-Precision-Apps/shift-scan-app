
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4b0bd67a-77fb-566b-acc5-3e671f4d026a")}catch(e){}}();
import prisma from "../lib/prisma.js";
export async function saveFCMToken(req, res) {
    const userId = req.user?.id; // assuming verifyToken middleware sets req.user
    const { token } = req.body;
    if (!userId) {
        return res
            .status(401)
            .json({ success: false, error: "No authenticated user" });
    }
    if (!token) {
        return res.status(400).json({ success: false, error: "No token provided" });
    }
    try {
        await prisma.fCMToken.deleteMany({ where: { userId } });
        await prisma.fCMToken.create({
            data: {
                token,
                userId,
                platform: "web",
                lastUsedAt: new Date(),
                isValid: true,
            },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error("Error saving FCM token:", error);
        return res
            .status(500)
            .json({ success: false, error: "Failed to save FCM token" });
    }
}
//# sourceMappingURL=tokenController.js.map
//# debugId=4b0bd67a-77fb-566b-acc5-3e671f4d026a
