import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Authorization header missing" });
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Token missing" });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ error: "JWT_SECRET not configured" });
    }
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded; // make user info available in routes
        next();
    }
    catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}
//# sourceMappingURL=authMiddleware.js.map