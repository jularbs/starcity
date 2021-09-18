const express = require("express");
const router = express.Router();
const { create, update, list, remove } = require("../controllers/rideCategory");

//Version 1.0
router.post("/v1/ride-category", create);
router.put("/v1/ride-category", update);
router.get("/v1/ride-categories", list);
router.delete("/v1/ride-category", remove);

module.exports = router;
