const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} = require("./banner.controller");

const { requireSignin, authMiddleware } = require("../auth/auth.controller");
//Version 1.0
router.post("/v1/banner", requireSignin, authMiddleware, create);

router.put("/v1/banner", requireSignin, authMiddleware, update);
router.put(
  "/v1/banner/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

router.get("/v1/banner", list);
// router.get("/v1/post/:slug", read);
router.delete("/v1/banner", requireSignin, authMiddleware, remove);

module.exports = router;
