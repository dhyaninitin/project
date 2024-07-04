const mongoose = require("mongoose");

var generatedDocument = mongoose.Schema({
  userid: String,
  generateddocumentid: String,
  templatetype: String,
  generateddocument: String,
  generatedat: Date
});

var generatedDocumentModel = mongoose.model(
  "Generated-Document-Tbl",
  generatedDocument
);

module.exports = generatedDocumentModel;
