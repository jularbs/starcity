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
  smTicketTest,
  smTicketExpiry,
  smTicketTransact,
  smTicketVoid,
  bpiTransact,
} = require("./webhooks.controller");

//Version 1.0
router.post("/v1/paymaya/payment-success", paymayaPaymentSuccess);
router.post("/v1/paymaya/payment-failed", paymayaPaymentFailed);
router.post("/v1/paymaya/payment-expired", paymayaPaymentExpired);
router.post("/v1/dragonpay/callback", dragonPaySuccess);
router.get("/v1/dragonpay/return", dragonPayReturn);

router.get("/v1/smticket/test", smTicketTest);
router.get("/v1/smticket/expiry", smTicketExpiry);
router.post("/v1/smticket/transact", smTicketTransact);
router.patch("/v1/smticket/void", smTicketVoid);

router.get("/v1/bpi", bpiTransact)
module.exports = router;
