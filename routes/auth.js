const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  changePassword,
  requireSignin,
  authMiddleware,
  validateToken,
  read,
  update,
  list,
  remove
} = require("../controllers/auth.js");

const { list: audit } = require("../controllers/auditTrail");
const { createRateLimiter } = require("../helpers/rateLimiter");

router.post("/v1/signup",
  createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 60 minutes." }),
  signup);
router.post("/v1/signin",
  createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 5, message: "Too many attempts, please try again in 15 minutes." }),
  signin);
router.post(
  "/v1/change-password",
  requireSignin,
  authMiddleware,
  changePassword
);

router.get("/v1/signout", signout);

router.get("/v1/validate-token", requireSignin, authMiddleware, validateToken);

router.get("/v1/audit-trail", requireSignin, authMiddleware, audit);

router.delete("/v1/user/:id", requireSignin, authMiddleware, remove);
router.get("/v1/user/:id", requireSignin, authMiddleware, read);
router.get("/v1/user", requireSignin, authMiddleware, list);
router.patch("/v1/user", requireSignin, authMiddleware, update);


module.exports = router;
