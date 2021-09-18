const express = require("express");
const router = express.Router();
const { create, read, list, update, remove } = require("../controllers/ride");

//Version 1.0
router.post("/v1/ride", create);
router.put("/v1/ride", update);
router.get("/v1/ride", list);
router.get("/v1/ride/:slug", read);
router.delete("/v1/ride", remove);

module.exports = router;
