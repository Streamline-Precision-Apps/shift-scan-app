
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="3a7d99ef-022f-5745-a0df-dd4aada0fcb4")}catch(e){}}();
import express from "express";
import { getCookie, setCookie, deleteCookie, } from "../controllers/cookiesController.js";
const router = express.Router();
router.get("/", getCookie);
router.post("/", setCookie);
router.put("/", setCookie);
router.delete("/", deleteCookie);
export default router;
//# sourceMappingURL=cookiesRoutes.js.map
//# debugId=3a7d99ef-022f-5745-a0df-dd4aada0fcb4
