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

router.post("/v1/signup", signup);
router.post("/v1/signin", signin);
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
