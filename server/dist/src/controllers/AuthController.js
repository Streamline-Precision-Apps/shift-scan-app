import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../lib/prisma.js";
dotenv.config();
export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Missing credentials" });
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ error: "Invalid credentials" });
        const payload = {
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
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        return res.status(200).json({ message: "Login successful", token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
};
//# sourceMappingURL=AuthController.js.map