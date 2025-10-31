import express from "express";
import {
  getCookie,
  setCookie,
  deleteCookie,
  deleteAllCookie,
  getCookieList,
} from "../controllers/cookiesController.js";

const router = express.Router();

router.get("/", getCookie);
router.get("/list", getCookieList);
router.post("/", setCookie);
router.put("/", setCookie);
router.delete("/", deleteCookie);
router.delete("/clear-all", deleteAllCookie);

export default router;
