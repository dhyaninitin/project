import { environment } from "src/environments/environment";

const baseUrl = environment.apiUrl;
const employee = `${baseUrl}/api/employee`;
const auth = `${baseUrl}/api/auth`;

export const employee_api_routes = {
  GET_EMPLOYEE_TEMPLATES: `${employee}/getEmployeeTemplates`,
  GET_EMPLOYEE_TEMPLATES_WHILE_SCROLL: `${employee}/getEmployeeTemplatesWhileScroll`,
  VERIFY_TEMPLATE: `${employee}/verifyTemplate`,
  CREATE_TEMPLATE: `${employee}/createTemplate`,
  UPDATE_TEMPLATE: `${employee}/updateTemplate`,
  DELETE_TEMPLATE: `${employee}/deleteTemplate`,
  TEMPLATE_STATUS_CHANGE: `${employee}/templateStatusChange`,
  DELETE_EMPLOYEE_COMPONENT: `${employee}/deleteEmployeeComponent`,
  DELETE_EMPLOYEE_RELATED_COMPONENT: `${employee}/deleteEmployeeRelatedComponent`,
  GET_PLACEHOLDER_TEXT: `${employee}/getPlaceholderText`,
  SEND_INVOICE_THROUGH_EMAIL: `${employee}/sendInvoiceThroughEmail`,
  GET_HANDLE_BARS: `${employee}/getHandleBars`,
  GET_TEMPLATES_TYPE: `${employee}/getTemplatesType`,
  ADD_NEW_TEMPLATE_TYPE: `${employee}/addNewTemplateType`,
  DELETE_ADDED_TEMPLATE_TYPE: `${employee}/deleteAddedTemplateType`,
  CHECK_TEMPLATE_NAME_EXIST: `${employee}/checkTemplateNameExist`,
  CREATE_GENERATED_DOCUMENT_SERIAL_NO: `${employee}/createGeneratedDocumentSerialNo`,
  GET_GENERATED_DOCUMENT_SERIAL_NO: `${employee}/getGeneratedDocumentSerialNo`,
  GET_LIBRARY_TEMPLATES: `${employee}/getLibraryTemplates`,
  DELETE_CUSTOM_TEMPLATE: `${employee}/deleteCustomTemplate`,
  POST_USER_FEEDBACK: `${employee}/userFeedback`,
  GET_USER_FEEDBACK: `${employee}/getUserFeedback`,
  DELETE_USER_FEEDBACK: `${employee}/deleteUserFeedback`,
  UPDATE_USER_FEEDBACK: `${employee}/updateUserFeedback`,
  CREATE_DEFAULT_LIBRARY_TEMPLATE: `${employee}/defaultLibraryTemplate`,
  ADD_NEW_PLACEHOLDER: `${employee}/addNewPlaceholder`,
  CREATE_GLOBAL_TEMPLATE: `${employee}/createGlobalTemplate`,
  CHECK_GLOBAL_TEMPLATE_EXIST: `${employee}/checkGlobalTemplateNameExist`,
  GET_GLOBAL_TEMPLATES: `${employee}/getGlobalTemplates`,
  GET_GLOBAL_TEMPLATES_WHILE_SCROLL: `${employee}/getGlobalTemplatesWhileScroll`,
  UPDATE_GLOBAL_TEMPLATE: `${employee}/updateGlobalTemplate`,
  DELETE_GLOBAL_TEMPLATE: `${employee}/deleteGlobalTemplate`,
  CREATE_NEW_GLOBAL_PLACEHOLDER_TYPE: `${employee}/createNewGlobalPlaceholderType`,
  GET_GLOBAL_PLACEHOLDER_TYPES: `${employee}/getGlobalPlaceholderTypes`,
  DELETE_GLOBAL_PLACEHOLDER_TYPE: `${employee}/deleteGlobalPlaceholderType`,
  SAVE_GENERATED_DOCUMENT: `${employee}/saveGeneratedDocument`,
  GET_GENERATED_DOCUMENTS: `${employee}/getGeneratedDocuments`,
  UPLOAD_USER_PROFILE: `${employee}/uploadUserProfile`,
  GET_USER_PROFILE: `${employee}/getUserProfile`
};

export const auth_api_routes = {
  SIGNUP: `${auth}/signup`,
  LOGIN: `${auth}/login`,
  FORGET_PASSWORD: `${auth}/forgetPassword`,
  GOOGLE_LOGIN_INFO: `${auth}/googleLoginInfo`,
  SEND_OTP: `${auth}/sendOtp`,
  CHECK_OTP: `${auth}/checkOtp`
};
