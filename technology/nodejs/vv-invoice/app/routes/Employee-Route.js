const auth = require('../middleware/auth');
const express = require("express");
const employeeRouter = express.Router();
const {
  createEmployeeTemplate,
  getEmployeeTemplates,
  updateEmployeeTemplate,
  deleteEmployeeTemplate,
  templateStatusChange,
  deleteEmployeeComponent,
  deleteEmployeeRelatedComponent,
  sendInvoiceThroughEmail,
  getTemplatesType,
  addNewTemplateType,
  deleteAddedTemplateType,
  checkTemplateNameExist,
  getEmployeeTemplatesWhileScroll,
  generatedDocumentSerialNo,
  getGeneratedDocumentSerialNo,
  getLibraryTemplates,
  deleteCustomTemplate,
  postUserFeedback,
  getUserFeedback,
  updateUserFeedback,
  deleteUserFeedback,
  createDefaultLibraryTemplate,
  createGlobalTemplate,
  getGlobalTemplates,
  updateGlobalTemplate,
  deleteGlobalTemplate,
  createNewGlobalPlaceholderType,
  getGlobalPlaceholderTypes,
  deleteGlobalPlaceholderType,
  getGlobalTemplatesWhileScroll,
  checkGlobalTemplateNameExist,
  verifyTemplate,
  saveGeneratedDocument,
  getGeneratedDocuments,
  uploadUserProfile,
  getUserProfile
} = require("../controllers/Employee-Controller");

employeeRouter.post("/createTemplate/:id", auth, createEmployeeTemplate);

employeeRouter.put("/updateTemplate/:templateid", auth, updateEmployeeTemplate);

employeeRouter.delete("/deleteTemplate/:templateid/:id", auth, deleteEmployeeTemplate);

employeeRouter.get("/getEmployeeTemplates/:id", auth, getEmployeeTemplates);

employeeRouter.put('/templateStatusChange/:templateid/:status', auth, templateStatusChange);

employeeRouter.delete('/deleteEmployeeComponent/:componentid', auth, deleteEmployeeComponent);

employeeRouter.delete('/deleteEmployeeRelatedComponent/:templateid', auth, deleteEmployeeRelatedComponent);

employeeRouter.post('/sendInvoiceThroughEmail/:recipientEmail', auth, sendInvoiceThroughEmail);

employeeRouter.get('/getTemplatesType/:id', auth, getTemplatesType);

employeeRouter.post('/addNewTemplateType/:id', auth, addNewTemplateType);

employeeRouter.delete('/deleteAddedTemplateType/:id', auth, deleteAddedTemplateType);

employeeRouter.get('/checkTemplateNameExist/:_id/:checkTemplateName', auth, checkTemplateNameExist);

employeeRouter.get('/getEmployeeTemplatesWhileScroll/:id', auth, getEmployeeTemplatesWhileScroll);

employeeRouter.get('/verifyTemplate/:templateid', auth, verifyTemplate);

employeeRouter.put('/createGeneratedDocumentSerialNo/:id', auth, generatedDocumentSerialNo);

employeeRouter.get('/getGeneratedDocumentSerialNo/:id', auth, getGeneratedDocumentSerialNo);

employeeRouter.get('/getLibraryTemplates/:id', auth, getLibraryTemplates);

employeeRouter.delete('/deleteCustomTemplate/:id', auth, deleteCustomTemplate);

employeeRouter.post('/userFeedback', auth, postUserFeedback);

employeeRouter.get('/getUserFeedback', auth, getUserFeedback);

employeeRouter.put('/updateUserFeedback', auth, updateUserFeedback);

employeeRouter.delete('/deleteUserFeedback/:id', auth, deleteUserFeedback);

employeeRouter.post('/defaultLibraryTemplate', auth, createDefaultLibraryTemplate);

employeeRouter.post('/createGlobalTemplate/:id',auth, createGlobalTemplate);

employeeRouter.get('/getGlobalTemplates/:id', auth, getGlobalTemplates);

employeeRouter.get('/getGlobalTemplatesWhileScroll/:id', auth, getGlobalTemplatesWhileScroll);

employeeRouter.put('/updateGlobalTemplate/:id', auth, updateGlobalTemplate);

employeeRouter.delete('/deleteGlobalTemplate/:id', auth, deleteGlobalTemplate);

employeeRouter.post('/createNewGlobalPlaceholderType/:userid',auth, createNewGlobalPlaceholderType);

employeeRouter.get('/checkGlobalTemplateNameExist/:userid/:checkTemplateName',auth, checkGlobalTemplateNameExist)

employeeRouter.get('/getGlobalPlaceholderTypes/:userid',auth, getGlobalPlaceholderTypes);

employeeRouter.delete('/deleteGlobalPlaceholderType/:id',auth, deleteGlobalPlaceholderType);

employeeRouter.post('/saveGeneratedDocument/:userid',auth , saveGeneratedDocument);

employeeRouter.get('/getGeneratedDocuments/:userid',auth , getGeneratedDocuments);

employeeRouter.post('/uploadUserProfile/:userid',auth, uploadUserProfile);

employeeRouter.get('/getUserProfile/:userid',auth, getUserProfile);

module.exports = employeeRouter;
