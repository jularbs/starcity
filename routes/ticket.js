const express = require("express");
const router = express.Router();
const {
  create,
  read,
  update,
  list,
  remove,
  toggleStatus,
} = require("../controllers/ticket");

const { requireSignin, authMiddleware } = require("../controllers/auth");

//Version 1.0
router.post("/v1/ticket", requireSignin, authMiddleware, create);
router.put("/v1/ticket", requireSignin, authMiddleware, update);
router.get("/v1/ticket", list);
router.get("/v1/ticket/:slug", read);
router.delete("/v1/ticket", requireSignin, authMiddleware, remove);

router.put(
  "/v1/ticket/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

module.exports = router;
