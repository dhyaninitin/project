const mongoose = require("mongoose");

var templateTypeSchema = mongoose.Schema({
  userid: String,
  templatetype: String,
  createdat: Date
});

var templateTypeModel = mongoose.model("TemplateType-Tbl", templateTypeSchema);
module.exports = templateTypeModel;
