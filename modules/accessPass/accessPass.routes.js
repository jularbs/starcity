const express = require("express");
const router = express.Router();
const { download } = require("./accessPass.controller");

//Version 1.0
router.get("/v1/download/:salt/:refId/:ticketId", download);

module.exports = router;
