const express = require("express");
const router = express.Router();
const { getMedia, uploadMediaFromEditor } = require("../controllers/media");
const { requireSignin, authMiddleware } = require("../controllers/auth");

router.get("/v1/media", getMedia);

router.post("/v1/upload/editor", requireSignin, authMiddleware, uploadMediaFromEditor);

module.exports = router;
