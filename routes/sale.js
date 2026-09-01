const express = require("express");
const router = express.Router();
const {
  create,
  read,
  update,
  list,
  remove,
  sync,
  createCheckout,
  readBySaltRefID,
  createDragonPayRequest,
  resendAR,
  cleanUp,
  syncAP,
  regenerateAccessPass,
  resyncSaleByRefId
} = require("../controllers/sale");
const { createRateLimiter } = require("../helpers/rateLimiter");

const { requireSignin, authMiddleware } = require("../controllers/auth");
const { paymayaRequestCheckout } = require("../controllers/webhooks");

//Version 1.0
// router.post("/v1/sale", create);
// router.put("/v1/sale", update);
router.get("/v1/sale", requireSignin, authMiddleware, list);
router.get("/v1/sale/:refid", read);
// router.delete("/v1/sale", remove);
router.get("/v1/access-pass", createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 150, message: "Too many attempts, please try again in 15 minutes." }), readBySaltRefID);
// router.get("/v1/sync", sync);

router.post("/v1/paymaya/checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), paymayaRequestCheckout);
router.post("/v1/create-checkout", createRateLimiter({ windowMs: 5 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 5 minutes." }), createCheckout);
router.post("/v1/sale/resend-email", requireSignin, authMiddleware, resendAR);

//payment webhooks
// router.post("/v1/payment/dragonpay", createDragonPayRequest);

//Helper Functions
router.get("/v1/clean-up", requireSignin, authMiddleware, cleanUp);
// router.get("/v1/sync-ap", syncAP);
router.get("/v1/regenerate-sale/:id", requireSignin, authMiddleware, regenerateAccessPass)
router.get("/v1/resync-sale/:id", requireSignin, authMiddleware, resyncSaleByRefId);
module.exports = router;
