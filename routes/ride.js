const express = require("express");
const router = express.Router();
const { create, read, list, update, remove } = require("../controllers/ride");

const { requireSignin, authMiddleware } = require("../controllers/auth");

//Version 1.0
router.post("/v1/ride", requireSignin, authMiddleware, create);
router.put("/v1/ride", requireSignin, authMiddleware, update);
router.get("/v1/ride", list);
router.get("/v1/ride/:slug", read);
router.delete("/v1/ride/:slug", requireSignin, authMiddleware, remove);

module.exports = router;
