const mongoose = require("mongoose");

var answerSchema = mongoose.Schema({
    questionId: String,
    answer: String,
    userId: String,
    userAnswer: String
});

var answerModel = mongoose.model("Answer-Tbl", answerSchema);
module.exports = answerModel;