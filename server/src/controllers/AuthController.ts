import express from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../lib/prisma.js";
import config from "../lib/config.js";

dotenv.config();

interface JwtUserPayload {
  id: string;
}

export const loginUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  // 1. Check for missing credentials
  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" });

  try {
    // 2. Find user by username
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // 3. Verify password
    const validPassword = await compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const payload: JwtUserPayload = {
      id: user.id,
    };
    // create JWT token
    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiration, // 30 days
    });

    // set token in httpOnly cookie so client can send it with requests
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none", // necessary for cross-site cookies with credentials: 'include'
      maxAge: config.jwtExpiration * 1000, // convert seconds -> ms
    } as const;

    // name the cookie `token`; this allows the middleware to read it as a fallback
    res.cookie("session", token, cookieOptions);

    return res
      .status(200)
      .json({ message: "Login successful", token, user: { user: payload } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signOutUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // Clear the session cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    return res.status(200).json({ message: "Sign out successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
