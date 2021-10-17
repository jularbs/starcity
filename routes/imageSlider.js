const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
} = require("../controllers/imageSlider");

//Version 1.0
router.post("/v1/image-slider", create);

// router.put("/v1/post", update);
router.get("/v1/image-slider", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/image-slider", remove);

module.exports = router;
