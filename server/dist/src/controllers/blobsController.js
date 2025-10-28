
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="b215ede7-5059-5503-8ebd-c36b883b125f")}catch(e){}}();
import { getFirebaseAdmin } from "../lib/firebase.js";
export async function blobUpload(req, res) {
    try {
        const admin = getFirebaseAdmin();
        const bucket = admin.storage().bucket();
        const userId = req.body.userId;
        const file = req.file;
        const folder = req.body.folder || "profileImages";
        if (!userId) {
            return res.status(400).json({ error: "No userId provided" });
        }
        if (!file) {
            return res.status(400).json({ error: "No file provided" });
        }
        // Upsert: Save file (creates if new, overwrites if exists)
        const fileRef = bucket.file(`${folder}/${userId}.png`);
        const contentType = folder === "docs" ? "application/pdf" : "image/png";
        await fileRef.save(file.buffer, {
            contentType,
            public: true,
            metadata: {
                cacheControl: "no-cache", // Prevent caching old images
            },
        });
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
        return res.status(200).json({
            url: publicUrl,
            message: "Image uploaded successfully",
        });
    }
    catch (err) {
        console.error("Upload error:", err);
        return res.status(500).json({ error: "Upload failed" });
    }
}
export async function blobDelete(req, res) {
    try {
        const admin = getFirebaseAdmin();
        const bucket = admin.storage().bucket();
        const { userId, folder = "profileImages" } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "No userId provided" });
        }
        const fileRef = bucket.file(`${folder}/${userId}.png`);
        const [exists] = await fileRef.exists();
        if (!exists) {
            return res.status(404).json({ error: "File not found" });
        }
        await fileRef.delete();
        return res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Delete failed" });
    }
}
//# sourceMappingURL=blobsController.js.map
//# debugId=b215ede7-5059-5503-8ebd-c36b883b125f
