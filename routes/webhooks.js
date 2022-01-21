const express = require("express");
const router = express.Router();
const {
  paymayaAuthorized,
  paymayaCheckoutDropout,
  paymayaCheckoutFailure,
  paymayaCheckoutSuccess,
  paymayaPaymentExpired,
  paymayaPaymentFailed,
  paymayaPaymentSuccess,
  dragonPayReturn,
  dragonPaySuccess,
} = require("../controllers/webhooks");

//Version 1.0
router.post("/v1/paymaya/payment-success", paymayaPaymentSuccess);
router.post("/v1/paymaya/payment-failed", paymayaPaymentFailed);
router.post("/v1/paymaya/payment-expired", paymayaPaymentExpired);
router.post("/v1/paymaya/checkout-success", paymayaCheckoutSuccess);
router.post("/v1/paymaya/checkout-failure", paymayaCheckoutFailure);
router.post("/v1/paymaya/checkout-dropout", paymayaCheckoutDropout);
router.post("/v1/paymaya/authorized", paymayaAuthorized);
router.post("/v1/dragonpay/callback", dragonPaySuccess);
router.get("/v1/dragonpay/return", dragonPayReturn);

module.exports = router;
