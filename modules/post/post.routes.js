const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  uploadImage,
} = require("./post.controller");

const { requireSignin, authMiddleware } = require("../auth/auth.controller");

//Version 1.0
router.post("/v1/post", requireSignin, authMiddleware, create);
router.put("/v1/post", requireSignin, authMiddleware, update);
router.get("/v1/post", list);
router.get("/v1/post/:slug", read);
router.delete("/v1/post", requireSignin, authMiddleware, remove);

router.post("/v1/image-uploader", uploadImage);

module.exports = router;
