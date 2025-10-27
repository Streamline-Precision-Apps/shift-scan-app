import express from "express";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "../controllers/cookiesController.js";

const router = express.Router();

router.get("/", getCookie);
router.post("/", setCookie);
router.put("/", setCookie);
router.delete("/", deleteCookie);

export default router;
