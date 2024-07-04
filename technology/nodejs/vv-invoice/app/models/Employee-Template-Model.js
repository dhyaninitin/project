const mongoose = require("mongoose");

var employeeTemplate = mongoose.Schema({
  userid: String,
  templateid: String,
  templatename: String,
  templatedescription: String,
  templatetype: String,
  status: Number,
  createdat: Date,
  modifiedat: Date
});

var employeeTemplateModel = mongoose.model(
  "Employee-Template-Tbl",
  employeeTemplate
);
module.exports = employeeTemplateModel;
