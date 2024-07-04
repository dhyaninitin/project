const express = require("express");
const authRouter = express.Router();

const {
  signup,
  login,
  forgetPassword,
  loginThroughGoogle,
  sendOtpToUserEmail,
  checkOtp
} = require("../controllers/Auth-Controller");

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/forgetPassword", forgetPassword);

authRouter.post("/googleLoginInfo", loginThroughGoogle);

authRouter.post('/sendOtp', sendOtpToUserEmail);

authRouter.post('/checkOtp', checkOtp);

module.exports = authRouter;
