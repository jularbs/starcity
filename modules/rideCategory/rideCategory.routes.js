import express from "express";
const router = express.Router();
import { create, update, list, remove } from "./rideCategory.controller.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/ride-category", requireSignin, authMiddleware, create);
router.put("/v1/ride-category", requireSignin, authMiddleware, update);
router.get("/v1/ride-categories", list);
router.delete("/v1/ride-category", requireSignin, authMiddleware, remove);

export default router;