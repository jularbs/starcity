const express = require("express");
const router = express.Router();
const {
  paymayaSuccess
} = require("../controllers/webhooks");


//Version 1.0
router.get("/v1/paymaya-success", paymayaSuccess);


module.exports = router;
