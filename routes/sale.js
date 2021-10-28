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
  processPayment,
  processPaypalPayment,
  readBySaltRefID,
  test,
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

//payment webhooks
router.get("/v1/payment/:status/:option/:refid", processPayment);
router.put("/v1/payment/paypal", processPaypalPayment);

//TESTS
router.get("/v1/test", test);

module.exports = router;
