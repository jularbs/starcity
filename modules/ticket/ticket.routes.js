import express from "express";
const router = express.Router();
import {
  create,
  read,
  update,
  list,
  remove,
  toggleStatus,
} from "./ticket.controller.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
//Version 1.0
router.post("/v1/ticket", requireSignin, authMiddleware, create);
router.put("/v1/ticket", requireSignin, authMiddleware, update);
router.get("/v1/ticket", list);
router.get("/v1/ticket/:slug", read);
router.delete("/v1/ticket", requireSignin, authMiddleware, remove);

router.put(
  "/v1/ticket/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

export default router;