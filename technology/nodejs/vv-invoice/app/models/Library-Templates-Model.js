const mongoose = require("mongoose");

var htmlTemplate = mongoose.Schema({
  userid: String,
  templateid: String,
  templatetype: String,
  category: String,
  html: String,
  created_by: String,
  createdat: Date,
  modifiedat: Date,
});

var libraryTemplatesModel = mongoose.model(
  "Library-Templates-Tbl",
  htmlTemplate
);
module.exports = libraryTemplatesModel;
