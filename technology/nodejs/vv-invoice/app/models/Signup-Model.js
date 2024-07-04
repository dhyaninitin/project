const mongoose = require("mongoose");

var signUpSchema = mongoose.Schema({
  name: String,
  mobileno: Number,
  email: String,
  password: String,
  generateddocumentserialno: Number,
  createdat: Date,
  modifiedat: Date,
  base64img: String,
  // login from google info
  loginby: String,
  googleid: String
});

var signUpModel = mongoose.model("SignUp-Tbl", signUpSchema);
module.exports = signUpModel;
