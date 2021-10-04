const express = require("express");
const router = express.Router();
const { download } = require("../controllers/accessPass");

//Version 1.0
router.get("/v1/download/:salt/:refId/:ticketId", download);

module.exports = router;
