const express = require("express");
const router = express.Router();
const { create, read, list, update, remove } = require("../controllers/post");

//Version 1.0
router.post("/v1/post", create);
router.put("/v1/post", update);
router.get("/v1/post", list);
router.get("/v1/post/:slug", read);
router.delete("/v1/post", remove);

module.exports = router;
