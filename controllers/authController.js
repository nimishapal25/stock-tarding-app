const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const kite = require("../utils/zerodha");
const tickerService = require("../services/tickerService");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.mobile,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Throw error if no password or email
    if (!email || !password) {
      return next(new AppError("Please provide a email or password", 400));
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");
    // const correctPass = user.correctPassword(password, user.password);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    //If everything is okay the send 200 response with token
    const token = signToken(user._id);
    res.status(200).json({
      status: "Success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      err: err.message,
    });
  }
};

exports.zerodhaLogin = (req, res) => {
  const loginUrl = kite.getLoginURL();
  res.redirect(loginUrl);
};

exports.ZerodhaCallback = async (req, res) => {
  const { request_token } = req.query;

  try {
    const response = await kite.generateSession(
      request_token,
      process.env.KITE_API_SECRET,
    );

    const access_token = response.access_token;

    kite.setAccessToken(access_token);

    // 🔥 START WEBSOCKET HERE
    tickerService.startTicker(process.env.KITE_API_KEY, access_token);

    res.redirect("https://stock-tarding-app-fe.onrender.com/dashboard");
  } catch (err) {
    res.status(500).send("Auth failed");
  }
};
