const mongoose = require("mongoose");

var adminLoginSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String
});

var adminLoginModel = mongoose.model("Login-Tbl", adminLoginSchema);
module.exports = adminLoginModel;