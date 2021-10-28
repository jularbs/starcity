const express = require("express");
const router = express.Router();
const {
  signup,
  pendingUsers,
  processApproval,
  signin,
  signout,
  registeredUsers,
  deleteUser,
  //   requireSignin,
  //   createOTP,
  //   sendOTP,
  //   verifyOTP,
  //   verifyAccount,
  //   verifyThroughEmail,
  //   createChangePasswordToken,
  changePassword,
  requireSignin,
  authMiddleware,
} = require("../controllers/auth.js");

const { list } = require("../controllers/auditTrail");

router.post("/v1/signup", signup);
router.post("/v1/signin", signin);
router.post(
  "/v1/change-password",
  requireSignin,
  authMiddleware,
  changePassword
);

router.get("/v1/signout", signout);
router.get("/v1/pending-users", pendingUsers);
router.get("/v1/registered-users", registeredUsers);

router.put(
  "/v1/process-approval",
  requireSignin,
  authMiddleware,
  processApproval
);

router.delete("/v1/delete-user", requireSignin, authMiddleware, deleteUser);
router.post("/v1/audit-trail/list", requireSignin, authMiddleware, 
list);

module.exports = router;
