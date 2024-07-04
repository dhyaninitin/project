const mongoose = require("mongoose");

var signUpSchema = mongoose.Schema({
    userId: String,
    firstname: String,
    lastname: String,
    email: String,
    phone: Number,
    education: String,
    collegeCode: String,
    collegeName: String,
    year: String,
    attempts: Number,
    comment: String,
    score: Number,
    feedbackRating: Number,
    createdat: Date
});

var signUpModel = mongoose.model("SignUp-Tbl", signUpSchema);
module.exports = signUpModel;