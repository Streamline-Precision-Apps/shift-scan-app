import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../lib/prisma.js";

dotenv.config();

interface JwtUserPayload {
  id: string;
  username: string;
  permission: string;
  firstName: string;
  lastName: string;
  truckView: boolean;
  tascoView: boolean;
  laborView: boolean;
  mechanicView: boolean;
  accountSetup: boolean;
}

export const loginUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { username, password } = req.body as {
    username: string;
    password: string;
  };

  if (!username || !password)
    return res.status(400).json({ error: "Missing credentials" });

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const payload: JwtUserPayload = {
      id: user.id,
      username: user.username,
      permission: user.permission,
      firstName: user.firstName,
      lastName: user.lastName,
      truckView: user.truckView,
      tascoView: user.tascoView,
      laborView: user.laborView,
      mechanicView: user.mechanicView,
      accountSetup: user.accountSetup,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
