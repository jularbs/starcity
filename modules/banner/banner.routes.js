import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} from "./banner.controller.js";
import { requireSignin, authMiddleware } from "../auth/auth.controller.js";
//Version 1.0
router.post("/v1/banner", requireSignin, authMiddleware, create);

router.put("/v1/banner", requireSignin, authMiddleware, update);
router.put(
  "/v1/banner/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

router.get("/v1/banner", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/banner", requireSignin, authMiddleware, remove);

export default router;