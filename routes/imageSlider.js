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

const { requireSignin, authMiddleware } = require("../controllers/auth");
//Version 1.0
router.post("/v1/image-slider", requireSignin, authMiddleware, create);

router.put("/v1/image-slider", requireSignin, authMiddleware, update);
router.put(
  "/v1/image-slider/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

router.get("/v1/image-slider", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/image-slider", requireSignin, authMiddleware, remove);

module.exports = router;
