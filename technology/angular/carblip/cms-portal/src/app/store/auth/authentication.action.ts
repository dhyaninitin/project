import { Action } from '@ngrx/store';
import {
  Profile,
  UpdateProfile,
  UpdateUser,
} from 'app/shared/models/user.model';

/**
 * Actions
 */

export const SET_DID_FETCH = '@lc/authentication/set-isbusy';
export class SetDidFetch implements Action {
  readonly type = SET_DID_FETCH;

  constructor(public payload: boolean) {}
}

export const LOGIN = '@lc/authentication/login';
export interface LoginPayload {
  email: string;
  password: string;
}
export class Login implements Action {
  readonly type = LOGIN;

  constructor(public payload: LoginPayload) {}
}

export const LOGIN_SUCCESFUL = '@lc/authentication/login-successful';
export interface LoginSuccessfulPayload {
  access_token: string;
  token_type: string;
  expires_at: string;
}
export class LoginSuccessful implements Action {
  readonly type = LOGIN_SUCCESFUL;

  constructor(public payload: LoginSuccessfulPayload) {}
}

export const LOGIN_FAILED = '@lc/authentication/login-failed';
export class LoginFailed implements Action {
  readonly type = LOGIN_FAILED;

  constructor(public payload: string) {}
}

export const GET_USER_INFO = '@lc/authentication/get-user';
export class GetUserInfo implements Action {
  readonly type = GET_USER_INFO;
  constructor() {}
}

export const GET_USER_INFO_SUCCESSFUL =
  '@lc/authentication/get-user-successful';
export class GetUserInfoSuccessful implements Action {
  readonly type = GET_USER_INFO_SUCCESSFUL;
  constructor(public payload: Profile) {}
}

export const GET_USER_INFO_FAILED = '@lc/authentication/get-user-failed';
export class GetUserInfoFailed implements Action {
  readonly type = GET_USER_INFO_FAILED;

  constructor(public payload: string) {}
}

/**
 * Update
 */

export const UPDATE_USER_INFO = '@lc/authentication/update-user';
export class UpdateUserInfo implements Action {
  readonly type = UPDATE_USER_INFO;
  constructor(public payload: UpdateProfile) {}
}

export const UPDATE_USER_INFO_SUCCESSFUL =
  '@lc/authentication/update-user-successful';
export class UpdateUserInfoSuccessful implements Action {
  readonly type = UPDATE_USER_INFO_SUCCESSFUL;
  constructor(public payload: Profile) {}
}

export const UPDATE_USER_INFO_FAILED = '@lc/authentication/update-user-failed';
export class UpdateUserInfoFailed implements Action {
  readonly type = UPDATE_USER_INFO_FAILED;

  constructor(public payload: string) {}
}

export const LOGOUT = '@lc/authentication/logout';
export class Logout implements Action {
  readonly type = LOGOUT;

  constructor() {}
}

export const LOGOUT_SUCCESSFUL = '@lc/authentication/logout-successful';
export class LogoutSuccessful implements Action {
  readonly type = LOGOUT_SUCCESSFUL;

  constructor() {}
}

//#region Clear Detail
export const CLEAR_DETAIL = '@lc/authentication/clear-detail';
export class ClearDetail implements Action {
  readonly type = CLEAR_DETAIL;
  constructor() {}
}
//#endregion

// Actions data type
export type Actions =
  | SetDidFetch
  | Login
  | LoginSuccessful
  | LoginFailed
  | Logout
  | LogoutSuccessful
  | GetUserInfo
  | GetUserInfoSuccessful
  | GetUserInfoFailed
  | UpdateUserInfo
  | UpdateUserInfoSuccessful
  | UpdateUserInfoFailed
  | ClearDetail;
