const express = require("express");
const router = express.Router();
const { getMedia } = require("../controllers/media");

router.get("/v1/media", getMedia);

module.exports = router;
