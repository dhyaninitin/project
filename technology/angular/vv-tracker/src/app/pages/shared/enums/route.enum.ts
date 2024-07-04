import { environment } from "environments/environment";

const baseUrl = environment.apiUrl;
const admin = `${baseUrl}/api/admin`;
const errorLog = `${baseUrl}/api/admin`;

export const admin_api_routes = {
  // add user
  ADD_USER: `${admin}/addUser`,
  GET_USERS: `${admin}/getUsers`,
  UPDATE_USER: `${admin}/updateUser`,
  DELETE_USER: `${admin}/deleteUser`,
  UPDATE_USER_STATUS: `${admin}/updateUserStatus`,
  SEND_EMAIL: `${admin}/sendDetailsToUserViaEmail`,
  LOGOUT_USER: `${admin}/logoutUser`,
  EXPORT: `${admin}/exportFromTo`,

  // view user
  GET_USER_DAILY_DATA: `${admin}/getUserDailyData`,
  GET_USER_WEEKLY_DATA: `${admin}/getUserWeeklyData`,
  GET_USER_MONTHLY_DATA: `${admin}/getUserMonthlyData`,
  FILTER_USER_REPORTS: `${admin}/filterUserReports`,
  GET_USERS_FROM_TO: `${admin}/userDataFromTo`,
  DELETE_USER_SCREENSHOT: `${admin}/deleteUserScreenshot`,

  // auth
  LOGIN: `${admin}/login`,
  SEND_OTP: `${admin}/sendOtp`,
  CHECK_OTP: `${admin}/checkOtp`,
  FORGET_PASSWORD: `${admin}/forgetPassword`,

  // user permission
  ADD_USER_PERMISSION: `${admin}/addUserPermission`,
  GET_USERS_PERMISSION: `${admin}/getUsersPermission`,
  UPDATE_USER_PERMISSION: `${admin}/updateUserPermission`,
  DELETE_USER_PERMISSION: `${admin}/deleteUserPermission`,
  UPDATE_USER_STATUS_IN_PERMISSION: `${admin}/updateUserStatusInPermission`,
  SEND_EMAIL_TO_USER_PERMISSION: `${admin}/sendEmailInPermission`,

  // history
  GET_HISTORY: `${admin}/getHistory`,

  //tracker Logs
  GET_TRACKER_ERROR_LOGS: `${errorLog}/getAlllogError`,
  DELETE_LOGS_BY_IDS: `${errorLog}/deleteLogsByIds`,
  TRACKER_MARKED_AS_READ: `${errorLog}/logMarkAsRead`
};
