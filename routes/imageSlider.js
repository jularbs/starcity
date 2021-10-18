const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} = require("../controllers/imageSlider");

//Version 1.0
router.post("/v1/image-slider", create);

router.put("/v1/image-slider", update);
router.put("/v1/image-slider/toggle-status", toggleStatus);

router.get("/v1/image-slider", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/image-slider", remove);

module.exports = router;
