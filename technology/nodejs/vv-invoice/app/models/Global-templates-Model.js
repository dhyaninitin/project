const mongoose = require("mongoose");

var globalTemplate = mongoose.Schema({
  userid: String,
  templatename: String,
  description: String,
  templatetype: String,
  html: String,
  createdat: Date,
  modifiedat: Date
});

var globalTemplateModel = mongoose.model(
  "Global-Templates-Tbl",
  globalTemplate
);
module.exports = globalTemplateModel;
