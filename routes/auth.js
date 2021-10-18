const express = require("express");
const router = express.Router();
const {
  signup,
  pendingUsers,
  processApproval,
  signin,
  //   signout,
  //   requireSignin,
  //   createOTP,
  //   sendOTP,
  //   verifyOTP,
  //   verifyAccount,
  //   verifyThroughEmail,
  //   createChangePasswordToken,
  //   changePassword,
} = require("../controllers/auth.js");

router.post("/v1/signup", signup);
router.get("/v1/pending-users", pendingUsers);

router.put("/v1/process-approval", processApproval);
router.post("/v1/signin", signin);

module.exports = router;
