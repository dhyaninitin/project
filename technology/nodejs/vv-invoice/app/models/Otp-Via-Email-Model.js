const mongoose = require("mongoose");

var otpViaEmail = mongoose.Schema({
  email: String,
  otp: Number,
  requestcount: Number,
  createdat: Date
});

var otpViaEmailModel = mongoose.model("Otp-Via-Email-Tbl", otpViaEmail);
module.exports = otpViaEmailModel;
