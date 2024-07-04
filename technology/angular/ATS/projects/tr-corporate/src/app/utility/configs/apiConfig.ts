import { environment } from "../../../environments/environment";

const basePath = environment.apiDomain + "/api/v1";
const auth = `${basePath}/auth`;
const master = `${basePath}/master`;
const account = `${basePath}/account`;
const user = `${basePath}/user`;
const jobs = `${basePath}/req/job`;
const reqJob = `${basePath}/req/job`;
const offerSetting = `${basePath}/offer/settings`;
const offer = `${basePath}/offer`;

// const localhost = "http://localhost:3000/api/v1/offer";

export const api_routes = {
  // auth module
  REGISTER: `${auth}/registration`,
  VERIFICATION: `${auth}/accountverification`,
  VALIDATE_EMAIL: `${auth}/validateemail`,
  VALIDATE_ACCOUNT: `${auth}/accountverification`,
  LOGIN: `${auth}/login`,
  FORGOT_PASSWORD: `${auth}/forgotpassword`,
  RESET_PASSWORD: `${auth}/resetpassword/$resetPassToken`,
  INVTE_SET_PASWORD: `${user}/newuserregister`,
};

export const secure_api_routes = {
  // auth module
  CHANGE_PASSWORD: `${auth}/changepassword`,
  REFRESH_TOKEN: `${auth}/token/$refreshToken`,
  LOGOUT_ALL: `${auth}/logout/all`,
  LOGOUT: `${auth}/logout`,

  // permission
  ACCOUNT_LIST: `${auth}/user/account`,
  ACCOUNT: `${basePath}/account`,
  USER: `${user}/userdetail`,
  USER_UPDATE: `${auth}/user`,

  //master
  COUNTRY_LIST: `${master}/countries`,
  STATE_LIST: `${master}/states`,
  CITY_LIST: `${master}/cities`,
  INDUSTRY_LIST: `${master}/industries`,
  PERMISSIONS_LIST: `${master}/permission`,
  VIEW_PERMISSION: `${master}/permission`,
  PERMISSIONS_UPDTAE: `${master}/permission`,
  TRANSLATION: `${master}/translation`,
  BUSINESS_VERTICLE: `${master}/businessvertical`,
  DESIGNATION_AUTOSEARCH: `${master}/designation`,
  PRACTICE_LIST: `${master}/practice`,
  DEPARTMENT_LIST: `${master}/department`,
  CURRENCY_LIST: `${master}/currency`,
  FUNCTIONAL_AREA: `${master}/functionalareas`,
  SKILLS_LIST: `${master}/skills`,
  APPROVAL_LIST: `${master}/approvalworkflow`,

  // ACCOUNT: `${auth}/account`,
  USER_LIST: `${account}/userslist`,
  USER_ROLES: `${account}/role`,
  SHORT_NAME: `${account}/validateshortname`,
  ADD_ROLE: `${account}/role`,
  DELETE_ROLE: `${account}/role`,
  UPDATE_ROLE: `${account}/role`,
  GET_ROLE: `${account}/roledetail`,
  EXPORT_FILE: `${account}/userslist/export`,
  EXPORT_CSV: `${account}/userslist/export`,

  // User Management
  GET_USER: `${user}/userdetailbyemail`,
  ADD_USER: `${user}/adduser`,
  UPDATE_USER: `${account}/user`,
  UPDATE_USER_STATUS: `${user}/status`,
  DELETE_USER: `${user}/delete`,
  REINVITE_USER: `${user}/invite`,

  /// User
  DEFAULT_ROLES: `${user}/roletypes`,

  /// Profile
  PRESIGNEDURL_IMAGE: `${user}/image`,

  /// Job Module
  GET_GRADE: `${jobs}/grade`,
  PARSE_JD: `${jobs}/parse/jd`,

  //Hiring
  TEAM_AUTO_SUGGESTION: `${jobs}/autosuggesion`,
  FETCH_TEAM: `${jobs}/team`,
  DELETE_TEAM_USER: `${jobs}/team/user`,
  ADD_TEAM_USERS: `${jobs}/team/users`,

  // publish
  PUBLISH_JOB: `${jobs}/publish`,
  LIST_ALL_JOB: `${jobs}`,

  //bulk action status
  BULK_ACTIONS_PUT_STATUS: `${jobs}/status`,

  //approval
  JOB_APPROVAL: `${reqJob}/approval`,
  OFFER_APPROVAL: `${reqJob}/offer/approval`,

  // JOB WORKFLOW
  JOB_WORKFLOW_DROPDOWN_LIST: `${master}/workflow/candidate`,
  SUBMIT_JOB_WORKFLOW_INFO: `${jobs}/candidate/workflow`,
  FETCH_WORKFLOW_LIST: `${jobs}/workflow`,

  ZONE: `${account}/zone`,
  // User Management

  ADD_JOB: `${jobs}/info`,

  // google location

  GET_PLACES: `https://maps.googleapis.com/maps/api/place/autocomplete`,

  // Offer-Setting Routes

  GET_TEMPLATE_LIST: `${offerSetting}`,
  TEMPLATE: `${offerSetting}/template`,
  GET_TEMPLATE_COUNT: `${offerSetting}/count`,
  COMPONENTS_BY_TEMPLATEID: `${offerSetting}/component`,
  DELETE_ALL_COMPONENT_BY_TEMPLATEID: `${offerSetting}/allcomponent`,
  GET_GENERIC_SETTINGS: `${offerSetting}/generic`,
  UPDATE_GENERIC_SETTINGS: `${offerSetting}/generic`,
  GET_OFFER_ACTIVITY: `${offerSetting}/activity`,
  CUSTOM_FIELDS: `${offerSetting}/customfields`,
  DOCUMENT: `${offerSetting}/document`,
  GET_DOCUMENT_BY_ID: `${offerSetting}/documentbyid`,
  GET_PRESIGNED_URL: `${offerSetting}/presignedurl`,
  DOWNLOAD_DOCUMENT: `${offerSetting}/download`,
  GET_CUSTOM_FIELDS_COUNT: `${offerSetting}/customfieldscount`,
  CUSTOM_FIELD_BY_ID: `${offerSetting}/customfieldsbyid`,
  GET_DOCUMENT_COUNT: `${offerSetting}/documentcount`,
  REVISE_DOCUMENT: `${offerSetting}/revisedocument`,
  DELETE_ALL_REVISE_DOCS: `${offerSetting}/allrevisedocument`,
  USER_ID: `${offerSetting}/userid`,
  PLACEHOLDERS: `${offerSetting}/placeholders`,
  OFFER_JSON: `${offerSetting}/offerjson`,
  OFFER_VLOOKUP_JSON: `${offerSetting}/vlookup`
};

export const offer_api_routes = {
  GET_JOB_INFO: `${offer}/job/info`,
  CANDIDATE_INFO: `${offer}/candidate/info`,
  GET_OFFER_INFO: `${offer}/`,
  OFFER_INFO: `${offer}/info`,
  DOC_TO_PDF: `${offer}/docToPdf`,
  SALARY_STRUCTURE: `${offer}/salary`,
  APPROVALS: `${offer}/approvals`,
  FINAL_OFFER: `${offer}/`,
  SEND_EMAIL: `${offer}/sendEmail`,
  EMAIL_TEMPLATES: `${offer}/getEmailTemplates`,
  GENERIC_SETTINGS: `${offer}/generic`
};
