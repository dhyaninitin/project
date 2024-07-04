const mongoose = require("mongoose");

var collegeSchema = mongoose.Schema({
    name: String,
    code: String,
    isActive: String,
});

var collegeModel = mongoose.model("College-Tbl", collegeSchema);
module.exports = collegeModel;