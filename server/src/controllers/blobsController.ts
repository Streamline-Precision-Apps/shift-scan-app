import type { Request, Response } from "express";
import { getFirebaseAdmin } from "../lib/firebase.js";

export async function blobUpload(req: Request, res: Response) {
  try {
    const admin = getFirebaseAdmin();
    const bucket = admin.storage().bucket();

    // Use multer to parse multipart form data
    const userId = req.body.userId;
    const file = req.file;
    const folder = req.body.folder || "profileImages";

    if (!userId) {
      return res.status(400).json({ error: "No userId provided" });
    }
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Save to bucket
    const fileRef = bucket.file(`${folder}/${userId}.png`);
    const contentType = folder === "docs" ? "application/pdf" : "image/png";
    await fileRef.save(file.buffer, {
      contentType,
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
    return res.json({ url: publicUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
}

export async function blobDelete(req: Request, res: Response) {
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Delete failed" });
  }
}
