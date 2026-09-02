import express from "express";
const router = express.Router();
import {
  read,
  list,
  createCheckout,
  readBySaltRefID,
  resendAR,
  cleanUp,
  regenerateAccessPass,
  resyncSaleByRefId
} from "./sale.controller.js";
import { createRateLimiter } from "../../common/middleware/rate-limit.middleware.js";
import { requireSignin, authMiddleware } from "../../common/middleware/auth.middleware.js";
import { paymayaRequestCheckout } from "../webhooks/webhooks.controller.js";

router.get("/v1/sale", requireSignin, authMiddleware, list);
router.get("/v1/sale/:refid", read);
router.get("/v1/access-pass", createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 150, message: "Too many attempts, please try again in 15 minutes." }), readBySaltRefID);

router.post("/v1/paymaya/checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), paymayaRequestCheckout);
router.post("/v1/create-checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), createCheckout);
router.post("/v1/sale/resend-email", requireSignin, authMiddleware, resendAR);

//Helper Functions
router.get("/v1/clean-up", requireSignin, authMiddleware, cleanUp);
router.get("/v1/regenerate-sale/:id", requireSignin, authMiddleware, regenerateAccessPass)
router.get("/v1/resync-sale/:id", requireSignin, authMiddleware, resyncSaleByRefId);
export default router;