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
  test,
  createDragonPayRequest,
  resendAR,
} = require("../controllers/sale");

//Version 1.0
router.post("/v1/sale", create);
router.put("/v1/sale", update);
router.get("/v1/sale", list);
router.get("/v1/sale/:refid", read);
router.delete("/v1/sale", remove);
router.get("/v1/access-pass", readBySaltRefID);
router.get("/v1/sync", sync);

router.post("/v1/create-checkout", createCheckout);
router.post("/v1/sale/resend-email", resendAR);

//payment webhooks
router.put("/v1/payment/paypal", processPaypalPayment);
router.post("/v1/payment/dragonpay", createDragonPayRequest);

//TESTS
router.get("/v1/test", test);

module.exports = router;
