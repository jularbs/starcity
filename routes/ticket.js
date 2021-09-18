const express = require("express");
const router = express.Router();
const { create, read, update, list, remove } = require("../controllers/ticket");

//Version 1.0
router.post("/v1/ticket", create);
router.put("/v1/ticket", update);
router.get("/v1/ticket", list);
router.get("/v1/ticket/:slug", read);
router.delete("/v1/ticket", remove);

module.exports = router;
