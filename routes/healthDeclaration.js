const express = require("express");
const router = express.Router();

const { create, list, read } = require("../controllers/healthDeclaration");
//Version 1.0

router.post("/v1/health-declaration", create);
router.get("/v1/health-declaration", list);
router.get("/v1/health-declaration/:_id", read);

module.exports = router;
