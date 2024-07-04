const mongoose = require("mongoose");

var globalPlaceholderType = mongoose.Schema({
  userid: String,
  templatetype: String,
  createdat: Date
});

var globalPlaceholderTypeModel = mongoose.model(
  "Global-Template-Type-Tbl",
  globalPlaceholderType
);
module.exports = globalPlaceholderTypeModel;
