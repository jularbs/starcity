const express = require("express");
const router = express.Router();

const { create } = require("../controllers/healthDeclaration");
//Version 1.0

router.post("/v1/health-declaration", create);

module.exports = router;
