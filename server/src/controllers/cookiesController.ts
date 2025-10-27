// GET /api/cookies?name=key
import express from "express";

export function getCookie(req: express.Request, res: express.Response) {
  let { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Missing cookie name" });
  }
  if (Array.isArray(name)) name = name[0];
  if (typeof name !== "string") {
    return res.status(400).json({ error: "Invalid cookie name" });
  }
  const value = req.cookies?.[name];
  if (value === undefined) {
    if (name === "currentPageView") {
      return res.status(200).json({ value: "" });
    }
    return res.status(404).json({ error: "Cookie not found" });
  }
  res.json({ value });
}

// POST or PUT /api/cookies { name, value, options }
export function setCookie(req: express.Request, res: express.Response) {
  const { name, value, options } = req.body;
  if (!name || value === undefined) {
    return res.status(400).json({ error: "Missing name or value" });
  }
  res.cookie(name, value, options || {});
  res.json({ message: "Cookie set", name, value });
}

// DELETE /api/cookies?name=key or /api/cookies (delete all)
export function deleteCookie(req: express.Request, res: express.Response) {
  let { name } = req.query;
  if (name) {
    if (Array.isArray(name)) name = name[0];
    if (typeof name === "string") {
      res.clearCookie(name);
      return res.json({ message: `Cookie '${name}' deleted` });
    } else {
      return res.status(400).json({ error: "Invalid cookie name" });
    }
  }
  // Delete all cookies
  if (req.cookies) {
    Object.keys(req.cookies).forEach((cookieName) => {
      res.clearCookie(cookieName);
    });
  }
  res.json({ message: "All cookies deleted" });
}
