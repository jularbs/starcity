const express = require("express");
const router = express.Router();
const {
  create,
  read,
  list,
  update,
  remove,
  toggleStatus,
} = require("./paymentOption.controller");

const { requireSignin, authMiddleware } = require("../auth/auth.controller");
//Version 1.0
router.post("/v1/payment-option", requireSignin, authMiddleware, create);

router.put("/v1/payment-option", requireSignin, authMiddleware, update);
router.put(
  "/v1/payment-option/toggle-status",
  requireSignin,
  authMiddleware,
  toggleStatus
);

router.get("/v1/payment-option", list);
router.get("/v1/payment-option/:slug", read);

router.delete("/v1/payment-option", requireSignin, authMiddleware, remove);

module.exports = router;
