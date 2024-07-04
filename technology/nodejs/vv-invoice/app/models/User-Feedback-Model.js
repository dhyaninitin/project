const mongoose = require("mongoose");

var ratingSchema = mongoose.Schema({
  userid: String,
  username: String,
  useremail: String,
  starrating: Number,
  category: String,
  feedback: String,
  createdat: Date,
  modifiedat: Date
});

var userRatingModel = mongoose.model("User-Feedback-Tbl", ratingSchema);
module.exports = userRatingModel;
