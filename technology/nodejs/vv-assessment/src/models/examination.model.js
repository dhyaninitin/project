const mongoose = require("mongoose");

var testSchema = mongoose.Schema({
    question: String,
    category: String,
    level: String,
    a: String,
    b: String,
    c: String,
    d: String,
    answer: String,
    createdat: Date
});

var testModel = mongoose.model("Exam-Tbl", testSchema);
module.exports = testModel;