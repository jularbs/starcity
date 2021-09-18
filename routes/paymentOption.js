const express = require("express");
const router = express.Router();
const { create, read, list, update, remove } = require("../controllers/paymentOption");

//Version 1.0
router.post("/v1/payment-option", create);
router.put("/v1/payment-option", update);
router.get("/v1/payment-option", list);
router.get("/v1/payment-option/:slug", read);
router.delete("/v1/payment-option", remove);

module.exports = router;
