const mongoose = require("mongoose");

var employeeComponent = mongoose.Schema({
  userid: String,
  templateid: String,
  componentid: String,
  componentname: String,
  componenttype: String,
  status: Number,
  mathoperator: String,
  rule: String,
  hideifzero: Number,
  createdat: Date,
  modifiedat: Date
});

var employeeComponentModel = mongoose.model(
  "Employee-Component-Tbl",
  employeeComponent
);
module.exports = employeeComponentModel;
