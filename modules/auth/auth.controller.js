const User = require("../user/user.model");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");

const { add } = require("date-fns");
const { createEntry } = require("../auditTrail/auditTrail.controller");

exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ error: "Password and Confirm Password should match" });

  try {
    const user = await User.findOne({ email }).exec();

    if (user) {
      return res.status(400).json({
        error:
          "Email address is already registered. Please proceed to logging in.",
      });
    }

    const username = shortId.generate();
    const newUser = new User({
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

    await newUser.save();

    return res.json({
      success:
        "Signup Success! Please wait for your acccount to be processed.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Unable to signup new user.",
      message: error,
    });
  }

};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).exec();

    if (!user) {
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

    if (!user.authenticate(password)) {
      user.mistakes = user.mistakes + 1;
      await user.save();
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
    res.cookie("token", token, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      },
    });

    user.mistakes = 0;
    user.lastLogin = new Date();

    await user.save();

    createEntry(user.name, "Logged in to system", { email: email }, req);
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Unable to sign in. Please try again later.",
      message: error,
    });
  }
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.changePassword = async (req, res) => {
  try {
    const { _id, currentPassword, newPassword, confirmation } = req.body;

    const user = await User.findOne({ _id }).exec();
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

    await user.save();
    createEntry(user.name, `Changed Password`, {}, req);
    return res.json({ success: "Password successfully changed" });

  } catch (error) {
    return res
      .status(400)
      .json({ error: "Unable to change password. Please try again later" });
  }
};

//User CRUD
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id }).exec();

    if (!user)
      return res.status(400).json({ error: "User not found" })

    user.deletedAt = new Date();
    user.email = new Date().toISOString(); //convert to datetime so email can be registered again due to unique constraint

    await user.save();

    return res.json({
      success: "User removed successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Failed to remove user. Please try again later.",
    });
  }

};

exports.read = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id })
      .select("_id name email createdAt department role")
      .exec();

    if (!user)
      return res.status(400).json({ error: "User not found" });

    return res.json(user);
  } catch (e) {
    console.log("Error: ", e)
    return res.status(400).json({ error: "Error on getting user information" });
  }
};

exports.update = async (req, res) => {
  const { _id } = req.body;

  const user = await User.findOne({ _id: _id }).exec();

  if (!user)
    return res.status(400).json({ error: "User not found" })

  if (req.body?.name)
    user.name = req.body?.name;

  if (req.body?.status)
    user.status = req.body?.status;

  if (req.body?.email)
    user.email = req.body?.email;

  if (req.body?.department)
    user.department = req.body?.department;

  if (req.body?.role)
    user.role = req.body?.role;


  try {
    await user.save();
    return res.json({
      success: "User updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      error: "Failed to update user. Please try again later.",
    });
  }
};

exports.list = async (req, res) => {
  const {
    query = "",
    department = "",
    role = "",
    skip = 0,
    limit = 0,
    status = false,
  } = req.query;

  //init filters
  const filters = {};
  const andOperator = [];

  if (query) {
    const words = query.split(" ");
    words.map((word) => {
      andOperator.push({
        name: {
          $regex: `\\b${word.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&")}\\b`, //Escape "[", "]", and must be full words using \\b \\b
          $options: "i",
        },
      });
    });
  }

  if (status)
    filters.status = status

  if (department)
    filters.department = department;

  if (role)
    filters.role = role;

  if (andOperator.length > 0) {
    filters.$and = andOperator;
  }

  try {
    const users = await User.find({ ...filters })
      .select("_id name email createdAt department role status lastLogin")
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();

    const count = await User.countDocuments({ ...filters });

    return res.json({
      data: users,
      count: count
    });

  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Something went wrong"
    });
  }
}

exports.requireSignin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      //Handle Errors
      if (err) {
        if (err.name === 'TokenExpiredError')
          return res.status(401).json({ error: "Authentication Expired" })

        if (err.name === 'JsonWebTokenError')
          return res.status(401).json({ error: "Invalid Authentication" })

        if (err.name === 'NotBeforeError')
          return res.status(401).json({ error: "Invalid Authentication" })

      } else {
        //proceed
        req.user = decoded;
        next();
      }
    });
  } else {
    // Handle the case where the token is missing or invalid
    return res.status(400).json({ error: 'Permission Denied for this request' });
  }
}

exports.authMiddleware = async (req, res, next) => {
  // const authUserId = req.user._id;
  if (req.user?._id) {
    try {
      const user = await User.findById({ _id: req.user?._id }).exec();
      if (!user) {
        return res.status(401).json({
          error: "Requesting user invalid"
        });
      }
      req.profile = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid Authentication" });
    }
  } else {
    return res.status(401).json({ error: "Invalid Authentication" });
  }


};

exports.validateToken = (req, res) => {
  return res.json({ message: "VALID" });
};
