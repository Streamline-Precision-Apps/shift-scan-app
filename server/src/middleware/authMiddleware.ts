import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import config from "../lib/config.js";
import type { JwtUserPayload } from "../lib/jwt.js";

interface AuthenticatedRequest extends express.Request {
  user?: JwtUserPayload;
}

export function verifyToken(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  // Check Authorization header first (Bearer <token>) then fall back to cookie
  const authHeader = req.headers["authorization"] as string | undefined;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if ((req as any).cookies && (req as any).cookies.token) {
    token = (req as any).cookies.token;
  }

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

// middleware/authMiddleware.js
export function authorizeRoles(
  ...allowedRoles: ("USER" | "MANAGER" | "ADMIN" | "SUPERADMIN")[]
) {
  return (
    req: AuthenticatedRequest,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.permission)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
}
