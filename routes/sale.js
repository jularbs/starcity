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
  processPaypalPayment,
  readBySaltRefID,
  createDragonPayRequest,
  resendAR,
  cleanUp,
  syncAP,
} = require("../controllers/sale");

const { requireSignin, authMiddleware } = require("../controllers/auth");

//Version 1.0
router.post("/v1/sale", create);
router.put("/v1/sale", update);
router.get("/v1/sale", requireSignin, authMiddleware, list);
router.get("/v1/sale/:refid", read);
router.delete("/v1/sale", remove);
router.get("/v1/access-pass", readBySaltRefID);
router.get("/v1/sync", sync);

router.post("/v1/create-checkout", createCheckout);
router.post("/v1/sale/resend-email", requireSignin, authMiddleware, resendAR);

//payment webhooks
router.put("/v1/payment/paypal", processPaypalPayment);
router.post("/v1/payment/dragonpay", createDragonPayRequest);

//Helper Functions
router.get("/v1/clean-up", requireSignin, authMiddleware, cleanUp);
router.get("/v1/sync-ap", syncAP);

module.exports = router;
