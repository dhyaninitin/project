const mongoose = require("mongoose");

var sessionSchema = mongoose.Schema({
    collegeId: String,
    sessionId: String,
    isActive: String,
    year: String
});

var sessionModel = mongoose.model("Session-Tbl", sessionSchema);
module.exports = sessionModel;