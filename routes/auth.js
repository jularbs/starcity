const express = require("express");
const router = express.Router();
// const {
//   signup,
//   signin,
//   signout,
//   requireSignin,
//   createOTP,
//   sendOTP,
//   verifyOTP,
//   verifyAccount,
//   verifyThroughEmail,
//   createChangePasswordToken,
//   changePassword,
// } = require("../controllers/auth.js");


router.post("/signup", requireKeysMiddleware, signup);


module.exports = router;
