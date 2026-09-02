import express from "express";
const router = express.Router();
import {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} from "./paymentOption.controller.js";
import { requireSignin, authMiddleware } from "../auth/auth.controller.js";
//Version 1.0
router.post("/v1/payment-option", requireSignin, authMiddleware, create);

router.put("/v1/payment-option", requireSignin, authMiddleware, update);
router.put(
  "/v1/payment-option/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

router.get("/v1/payment-option", list);
router.get("/v1/payment-option/:slug", read);

router.delete("/v1/payment-option", requireSignin, authMiddleware, remove);

export default router;