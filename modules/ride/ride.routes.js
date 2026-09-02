const express = require("express");
const router = express.Router();
const { create, read, list, update, remove } = require("./ride.controller");

const { requireSignin, authMiddleware } = require("../auth/auth.controller");

//Version 1.0
router.post("/v1/ride", requireSignin, authMiddleware, create);
router.put("/v1/ride", requireSignin, authMiddleware, update);
router.get("/v1/ride", list);
router.get("/v1/ride/:slug", read);
router.delete("/v1/ride/:slug", requireSignin, authMiddleware, remove);

module.exports = router;
