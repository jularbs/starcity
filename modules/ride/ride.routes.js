import express from "express";
const router = express.Router();
import { create, read, list, update, remove } from "./ride.controller.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/ride", requireSignin, authMiddleware, create);
router.put("/v1/ride", requireSignin, authMiddleware, update);
router.get("/v1/ride", list);
router.get("/v1/ride/:slug", read);
router.delete("/v1/ride/:slug", requireSignin, authMiddleware, remove);

export default router;