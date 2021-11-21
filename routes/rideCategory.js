const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/rideCategory");

const { requireSignin, authMiddleware } = require("../controllers/auth");
//Version 1.0
router.post("/v1/ride-category", requireSignin, authMiddleware, create);
router.put("/v1/ride-category", requireSignin, authMiddleware, update);
router.get("/v1/ride-categories", list);
router.delete("/v1/ride-category", requireSignin, authMiddleware, remove);

module.exports = router;
