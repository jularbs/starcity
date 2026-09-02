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
import { requireSignin, authzMiddleware } from "../../common/middleware/auth.middleware.js";
import { paymayaRequestCheckout } from "../webhooks/webhooks.controller.js";

router.get("/v1/sale", requireSignin, authzMiddleware("admin"), list);
router.get("/v1/sale/:refid", read);
router.get("/v1/access-pass", createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 150, message: "Too many attempts, please try again in 15 minutes." }), readBySaltRefID);

router.post("/v1/paymaya/checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), paymayaRequestCheckout);
router.post("/v1/create-checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), createCheckout);
router.post("/v1/sale/resend-email", requireSignin, authzMiddleware("admin"), resendAR);

//Helper Functions
router.get("/v1/clean-up", requireSignin, authzMiddleware("admin"), cleanUp);
router.get("/v1/regenerate-sale/:id", requireSignin, authzMiddleware("admin"), regenerateAccessPass)
router.get("/v1/resync-sale/:id", requireSignin, authzMiddleware("admin"), resyncSaleByRefId);
export default router;