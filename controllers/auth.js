const User = require("../models/user");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");

const expressJwt = require("express-jwt");
const { add } = require("date-fns");
const { createEntry } = require("../controllers/auditTrail");
const axios = require("axios");
exports.signup = (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ error: "Password and Confirm Password should match" });

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error:
          "Email address is already registered. Please proceed to logging in.",
        message: err,
      });
    }

    let username = shortId.generate();
    let newUser = new User({
      name,
      email,
      password,
      username,
    });

    //create OTP for new user
    const OTP = newUser.makeOTP();
    const otpValidity = add(new Date(), {
      minutes: 10000,
    });
    newUser.otp = { token: OTP, validity: otpValidity };

    newUser.save(async (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to signup new user.",
          message: err,
        });
      }

      return res.json({
        success:
          "Signup Success! Please wait for your acccount to be processed.",
      });
    });
  });
};

exports.pendingUsers = (req, res) => {
  User.find({ status: false })
    .select("_id name email createdAt department role")
    .exec((err, users) => {
      if (err)
        res.status(400).json({ error: "Error on getting pending users" });
      res.json(users);
    });
};

exports.processApproval = async (req, res) => {
  const { _id, department, status } = req.body;
  let user = await User.findOne({ _id }).exec();
  if (!user) {
    res.status(400).json({ error: "User does not exist" });
  }

  if (status) {
    user.department = department;
    user.status = status;

    user.save((err, result) => {
      if (err)
        res.status(400).json({
          error: "Failed to process approval",
        });
      res.json({
        success: `User is now ${status ? "approved" : "disapproved"}`,
      });
      createEntry(
        req.profile.name,
        `Approved registration for ${user.name}`,
        {},
        req
      );
    });
  } else {
    User.deleteOne({ _id }).exec((err, result) => {
      if (err)
        res.status(400).json({
          error: "Failed to process approval",
        });
      res.json({
        success: `User is now ${status ? "approved" : "disapproved"}`,
      });
      createEntry(
        req.profile.name,
        `Disapproved registration for ${user.name}`,
        {},
        req
      );
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password, token } = req.body;
  //check if superadmin
  const captcha = await axios({
    method: "POST",
    url: "https://www.google.com/recaptcha/api/siteverify",
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    },
  });

  if (captcha.data.success) {
    //valid token
    //check if user exists
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "Email is not yet registered. Please create an account.",
        });
      }

      if (user.mistakes > 3) {
        return res.status(400).json({
          error:
            "Your account has been blocked due to many failed attempts to sign in. Please contact web administrator",
        });
      }
      //authenticate
      if (!user.authenticate(password)) {
        user.mistakes = user.mistakes + 1;
        user.save(async (err, success) => {
          console.log("Failed log in attempt by: ", user.email);
          console.log(
            "Account mistake icremented due to failed login attempt: ",
            user.email
          );
        });

        return res.status(400).json({
          error: "Email and password do not match.",
        });
      }
      if (!user.status) {
        return res.status(400).json({
          error: "Account is not yet approved.",
        });
      }
      //generate JWT
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, { expiresIn: "7d" });
      const { _id, name, email, department } = user;
      res.json({
        token,
        user: {
          _id,
          name,
          email,
          department,
        },
      });

      user.mistakes = 0;
      user.save(async (err, success) => {
        console.log("Failed log in attempt by: ", user.email);
        console.log(
          "Account mistake icremented due to failed login attempt: ",
          user.email
        );
      });

      createEntry(user.name, "Logged in to system", { email: email }, req);
    });
  } else {
    //invalid token
    createEntry(null, "Captcha blocked login", captcha.data, req);

    return res.status(400).json({
      error:
        "Bad Request due to robot test. Please try again or contact support.",
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.changePassword = (req, res) => {
  const { _id, currentPassword, newPassword, confirmation } = req.body;

  User.findOne({ _id }).exec((err, user) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to change password. Please try again later" });
    }

    if (!user.authenticate(currentPassword)) {
      return res.status(400).json({
        error: "Current password is incorrect.",
      });
    }

    if (newPassword !== confirmation) {
      return res.status(400).json({
        error: "New Password and confirmation should match",
      });
    }

    user.password = confirmation;

    user.save((err, result) => {
      if (err) {
        res.status(400).json({
          error: "Unable to change password. Please try again later",
        });
      }

      res.json({ success: "Password successfully changed" });
      createEntry(req.profile.name, `Changed Password`, {}, req);
    });
  });
};

exports.registeredUsers = (req, res) => {
  const { department } = req.query;
  if (!department) {
    User.find({ status: true })
      .select("_id name email createdAt department role")
      .exec((err, users) => {
        if (err)
          res.status(400).json({ error: "Error on getting registered users" });
        res.json(users);
      });
  } else {
    User.find({ status: true, department })
      .select("_id name email createdAt department role")
      .exec((err, users) => {
        if (err)
          res.status(400).json({ error: "Error on getting registered users" });
        res.json(users);
      });
  }
};

exports.deleteUser = (req, res) => {
  const { _id } = req.body;
  User.deleteOne({ _id }).exec((err, result) => {
    if (err) {
      res
        .status(400)
        .json({ error: "Unable to delete user. Please try again later" });
    }

    res.json({ success: "User deleted successfully." });
    createEntry(req.profile.name, `Deleted user`, { _id }, req);
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.authMiddleware = (req, res, next) => {
  if (req.user._id === process.env.SUPER_ADMIN_UN) {
    req.profile = {
      name: "superadmin",
    };
    next();
  } else {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      req.profile = user;
      next();
    });
  }
};

exports.validateToken = (req, res) => {
  return res.json({ message: "VALID" });
};

// exports.adminMiddleware = (req, res, next) => {
//   const adminUserId = req.user._id;
//   User.findById({
//     _id: adminUserId,
//   }).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: "User not found",
//       });
//     }

//     if (user.role !== 1) {
//       return res.status(400).json({
//         error: "Admin resource. Access denied.",
//       });
//     }

//     req.profile = user;
//     next();
//   });
// };

// exports.isVerifiedMiddleware = (req, res, next) => {
//   const { verificationMethod } = req.profile;

//   if (verificationMethod == "unverified") {
//     res.json({
//       error:
//         "Your account is not verified yet. Please check email/SMS to verify your account.",
//     });
//   } else {
//     next();
//   }
// };

// exports.sendOTP = async (req, res) => {
//   const etherealConfig = {
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: {
//       user: "martina.wisozk35@ethereal.email",
//       pass: "6WcZXHe5RNvWSWPUpN",
//     },
//   };

//   const transporter = nodemailer.createTransport(etherealConfig);

//   const details = {
//     to: req.otp.email,
//     from: "noreply@manilabroadcasting.com.ph",
//     subject: "Your OTP is ****",
//     text: `Your OTP is ${req.otp.token}, it will expire on ${req.otp.validity}`,
//   };

//   let info = await transporter.sendMail(details);

//   res.json(info);
// };

// exports.createOTP = (req, res, next) => {
//   const { userid } = req.params;

//   User.findOne({ _id: userid }).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: "User with that email does not exist. Please create an account.",
//       });
//     }

//     const OTP = user.makeOTP();
//     const otpValidity = add(new Date(), {
//       minutes: 5,
//     });

//     user.otp = { token: OTP, validity: otpValidity };

//     user.save((err, data) => {
//       if (err) {
//         return res.status(400).json({
//           error: "Error on database. Please try again",
//           message: err,
//         });
//       }

//       req.otp = {
//         token: data.otp.token,
//         validity: data.otp.validity,
//         email: data.email,
//       };
//       next();
//     });
//   });
// };

// exports.verifyOTP = (req, res, next) => {
//   const { _id, otp } = req.body;

//   User.findOne({ _id }).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: "User with that email does not exist. Please create an account.",
//       });
//     }

//     const currentTime = new Date();
//     if (isBefore(currentTime, user.otp.validity) && otp == user.otp.token) {
//       //removeOTP
//       user.otp = {};
//       user.save((err, data) => {
//         req.valid = true;
//         req.user = data;
//         next();
//       });
//     } else {
//       req.valid = false;
//       next();
//     }
//   });
// };

// exports.verifyAccount = (req, res) => {
//   const isValid = req.valid;

//   if (isValid) {
//     const user = req.user;
//     user.verificationMethod = "Verified via Email";
//     user.save((err, result) => {
//       if (err) {
//         return res.status(400).json({
//           error: err,
//         });
//       }
//       res.json({ success: true, message: "User is now verified" });
//     });
//   } else {
//     res.json({ error: "OTP is not valid. Please try again." });
//   }
// };

// exports.verifyThroughEmail = async (req, res) => {
//   const { _id, otp } = req.params;

//   try {
//     const user = await User.findOne({ _id }).exec();
//     const currentTime = new Date();
//     // if (isBefore(currentTime, user.otp.validity) && otp == user.otp.token) {
//     if (otp == user.otp.token) {
//       //removeOTP
//       user.otp = {};
//       user.verificationMethod = "Verified via Email";

//       user.save((err, data) => {
//         if (err) {
//           console.log(err);
//           res.json("Invalid Verification Token.");
//         }
//         res.redirect(`${process.env.FRONTEND_DOMAIN}msff/?verified=true`);
//       });
//     } else {
//       res.json(
//         "Invalid Token. Your account may already be verified. Please try logging in."
//       );
//     }
//   } catch (e) {
//     console.log(e);
//     res.json("Invalid Token");
//   }
// };

// exports.createChangePasswordToken = (req, res) => {
//   const { email } = req.body;

//   User.findOne({ email }).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: "The email you submitted is not yet registered.",
//       });
//     }

//     const changeToken = user.makeSalt();

//     const encryptedToken = user.encryptPassword(changeToken);

//     user.resetPasswordLink.token = encryptedToken;

//     user.save(async (err, data) => {
//       if (err) {
//         return res.status(400).json({
//           error: "Error on database. Please try again",
//           message: err,
//         });
//       }

//       //email link to user {`${process.env.FRONTEND_DOMAIN}/msff/auth/changepassword?i=${data._id}&t=${data.resetPasswordLink.token}`}

//       const details = {
//         to: email,
//         from: process.env.MBC_EMAIL,
//         subject: "Password Reset Request for DZRH News",
//         html: `
//         <h1>PASSWORD RESET</h1>
//         <p>If you requested a password reset, clink the link below to complete the process. If you didn't make this request, ignore this email.</p>
//         <a href="${process.env.FRONTEND_DOMAIN}msff/auth/changepassword?i=${data._id}&t=${data.resetPasswordLink.token}">Click here to change password.</a>
//         <p>If you encounter issues clinking the link above, copy and paste the following url in your browser:
//         ${process.env.FRONTEND_DOMAIN}/msff/auth/changepassword?i=${data._id}&t=${data.resetPasswordLink.token}</p>`,
//       };

//       try {
//         let info = await sendMail(details);
//       } catch (e) {
//         console.log(e);
//       }
//       res.json({
//         success: "Please check your email to reset your password",
//       });
//     });
//   });
// };

// exports.changePassword = (req, res) => {
//   const { _id, password, token } = req.body;

//   User.findOne({ _id }).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: "Error on changing password. User not found",
//       });
//     }

//     if (user.resetPasswordLink.token !== token) {
//       return res.status(400).json({
//         error: "Token invalid",
//       });
//     }

//     user.password = password;
//     user.resetPasswordLink.token = "";

//     user.save(async (err, data) => {
//       if (err) {
//         return res.status(400).json({
//           error: "Error on database. Please try again",
//           message: err,
//         });
//       }

//       const details = {
//         to: data.email,
//         from: process.env.MBC_EMAIL,
//         subject: "Change password confirmation",
//         html: `
//         <h1>PASSWORD CHANGE CONFIRMATION</h1>
//         <p>Your password was changed successfully. If you didn't make this request, please report this incident to contactus@dzrh.com.ph.</p>`,
//       };

//       try {
//         let info = await sendMail(details);
//       } catch (e) {
//         console.log(e);
//       }
//       res.json({
//         success: "Password changed successfully, please proceed to log in.",
//       });
//     });
//   });
// };
