const express = require("express");
const router = express.Router();
const {
  create,
  read,
  update,
  list,
  remove,
  sync,
} = require("../controllers/sale");

//Version 1.0
router.post("/v1/sale", create);
router.put("/v1/sale", update);
router.get("/v1/sale", list);
router.get("/v1/sale/:slug", read);
router.delete("/v1/sale", remove);

router.get("/v1/sync", sync);

module.exports = router;
