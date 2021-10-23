const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} = require("../controllers/banner");

//Version 1.0
router.post("/v1/banner", create);

router.put("/v1/banner", update);
router.put("/v1/banner/toggle-status", toggleStatus);

router.get("/v1/banner", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/banner", remove);

module.exports = router;
