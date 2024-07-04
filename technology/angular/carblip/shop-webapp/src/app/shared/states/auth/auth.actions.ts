import { Action } from '@ngrx/store';
import { IProfile, UserInfo } from 'app/shared/states/auth/auth.interfaces';

export const FETCH_USER_INFO = '[AUTH] Fetch user info';
export class FetchUserInfo implements Action {
  readonly type = FETCH_USER_INFO;

  constructor(public payload: string) {}
}

export const FETCH_USER_INFO_SUCCESS = '[AUTH] Fetch user info success';
export class FetchUserInfoSuccess implements Action {
  readonly type = FETCH_USER_INFO_SUCCESS;

  constructor(public payload: { data: any }) {}
}

export const FETCH_USER_INFO_FAILED = '[AUTH] Fetch user info failed';
export class FetchUserInfoFailed implements Action {
  readonly type = FETCH_USER_INFO_FAILED;

  constructor(public payload: { error: string }) {}
}

export const REGISTER_PHONE = '[AUTH] Register phone';
export class RegisterPhone implements Action {
  readonly type = REGISTER_PHONE;

  constructor(public payload: any) {}
}

export const REGISTER_PHONE_SUCCESS = '[AUTH] Register phone success';
export class RegisterPhoneSuccess implements Action {
  readonly type = REGISTER_PHONE_SUCCESS;

  constructor(public payload: { data: any }) {}
}

export const REGISTER_PHONE_FAILED = '[AUTH] Register phone failed';
export class RegisterPhoneFailed implements Action {
  readonly type = REGISTER_PHONE_FAILED;

  constructor(public payload: { error: string }) {}
}

export const REGISTER_PHONE_CLEAR = '[AUTH] Register phone clear';
export class RegisterPhoneClear implements Action {
  readonly type = REGISTER_PHONE_CLEAR;

  constructor() {}
}

export const VERIFY_PHONE = '[AUTH] Verify phone';
export class VerifyPhone implements Action {
  readonly type = VERIFY_PHONE;

  constructor(public payload: any) {}
}

export const VERIFY_PHONE_SUCCESS = '[AUTH] Verify phone success';
export class VerifyPhoneSuccess implements Action {
  readonly type = VERIFY_PHONE_SUCCESS;

  constructor(public payload: { data: any }) {}
}

export const VERIFY_PHONE_FAILED = '[AUTH] Verify phone failed';
export class VerifyPhoneFailed implements Action {
  readonly type = VERIFY_PHONE_FAILED;

  constructor(public payload: { error: string }) {}
}

export const VERIFY_PHONE_CLEAR = '[AUTH] Clear Verify phone state';
export class VerifyPhoneClear implements Action {
  readonly type = VERIFY_PHONE_CLEAR;

  constructor() {}
}

export const RESEND_CODE = '[AUTH] Resend Code';
export class ResendCode implements Action {
  readonly type = RESEND_CODE;

  constructor(public payload: any) {}
}

export const RESEND_CODE_SUCCESS = '[AUTH] Resend Code success';
export class ResendCodeSuccess implements Action {
  readonly type = RESEND_CODE_SUCCESS;

  constructor(public payload: any) {}
}

export const RESEND_CODE_FAILED = '[AUTH] Resend Code failed';
export class ResendCodeFailed implements Action {
  readonly type = RESEND_CODE_FAILED;

  constructor(public payload: { error: string }) {}
}

export const REGISTER_USER = '[AUTH] Register User';
export class RegisterUser implements Action {
  readonly type = REGISTER_USER;

  constructor(public payload: any) {}
}

export const REGISTER_USER_CLEAR = '[AUTH] Clear register user state';
export class RegisterUserClear implements Action {
  readonly type = REGISTER_USER_CLEAR;

  constructor() {}
}

export const REFRESH_USER_DATA = '[AUTH] REFRESH user details';
export class RefreshUserData implements Action {
  readonly type = REFRESH_USER_DATA;
}

// Profile
export const FETCH_USER_DATA = '[AUTH] Fetch user details';
export class FetchUserData implements Action {
  readonly type = FETCH_USER_DATA;
}

export const FETCH_USER_DATA_SUCCESS = '[AUTH] Fetch user details success';
export class FetchUserDataSuccess implements Action {
  readonly type = FETCH_USER_DATA_SUCCESS;

  constructor(public payload: { data: IProfile }) {}
}

export const FETCH_USER_DATA_FAILED = '[AUTH] Fetch user details failed';
export class FetchUserDataFailed implements Action {
  readonly type = FETCH_USER_DATA_FAILED;

  constructor(public payload: { error: string }) {}
}

export const SEND_USER_DATA = '[AUTH] Send user details';
export class SendUserData implements Action {
  readonly type = SEND_USER_DATA;
  constructor(public payload: UserInfo) {}
}

export const SEND_USER_DATA_SUCCESS = '[AUTH] Send user details success';
export class SendUserDataSuccess implements Action {
  readonly type = SEND_USER_DATA_SUCCESS;
  constructor(public payload: { data: string }) {}
}

export const SEND_USER_DATA_FAILED = '[AUTH] Send user details failed';
export class SendUserDataFailed implements Action {
  readonly type = SEND_USER_DATA_FAILED;
  constructor(public payload: { error: string }) {}
}

export const SEND_OTP_CODE = '[AUTH] Send otp code';
export interface SendOtpCodePayload {
  phone: string;
}
export class SendOtpCode implements Action {
  readonly type = SEND_OTP_CODE;
  constructor(public payload: SendOtpCodePayload) {}
}

export const SEND_OTP_CODE_SUCCESS = '[AUTH] Send opt code success';
export class SendOtpCodeSuccess implements Action {
  readonly type = SEND_OTP_CODE_SUCCESS;
  constructor(public payload: { data: string }) {}
}

export const SEND_OTP_CODE_FAILED = '[AUTH] Send opt code failed';
export class SendOtpCodeFailed implements Action {
  readonly type = SEND_OTP_CODE_FAILED;
  constructor(public payload: { error: string }) {}
}

export const SEND_PHONENO_FOR_OTP = '[AUTH] Send phone no';
export class SendPhoneForOtp implements Action {
  readonly type = SEND_PHONENO_FOR_OTP;
  constructor(public payload: object) {}
}

export const SEND_PHONENO_FOR_OTP_SUCCESS = '[AUTH] Send phone no success';
export class SendPhoneForOtpSuccess implements Action {
  readonly type = SEND_PHONENO_FOR_OTP_SUCCESS;
  constructor(public payload: { data: any }) {}
}

export const SEND_PHONENO_FOR_OTP_FAILED = '[AUTH] Send phone no failed';
export class SendPhoneForOtpFailed implements Action {
  readonly type = SEND_PHONENO_FOR_OTP_FAILED;
  constructor(public payload: { error: string }) {}
}

export const SEND_PHONENO_FOR_OTP_CLEAR = '[AUTH] Send phone no clear';
export class SendPhoneForOtpClear implements Action {
  readonly type = SEND_PHONENO_FOR_OTP_CLEAR;
  constructor() {}
}

export const INITIALIZE_PROFILE_STATE = '[AUTH] Initialize profile state';
export class InitializeProfileState implements Action {
  readonly type = INITIALIZE_PROFILE_STATE;
  constructor() {}
}

export const CLEAR_USER_INFO = '[AUTH]Clear user info';
export class ClearUserInfo implements Action {
  readonly type = CLEAR_USER_INFO;

  constructor() {}
}

export const UPDATE_USER_PROFILE = '[AUTH]Update User Profile';
export class UpdateUserProfile implements Action {
  readonly type = UPDATE_USER_PROFILE;

  constructor(public payload: object) {}
}

export const VERIFY_OTP = '[AUTH] Verify Otp';
export class VerifyOtp implements Action {
  readonly type = VERIFY_OTP;

  constructor(public payload: any) {}
}

export const VERIFY_OTP_SUCCESS = '[AUTH] Verify Otp success';
export class VerifyOtpSuccess implements Action {
  readonly type = VERIFY_OTP_SUCCESS;

  constructor(public payload: { data: any }) {}
}

export const VERIFY_OTP_FAILED = '[AUTH] Verify Otp failed';
export class VerifyOtpFailed implements Action {
  readonly type = VERIFY_OTP_FAILED;

  constructor(public payload: { error: string }) {}
}

export const VERIFY_OTP_CLEAR = '[AUTH] Clear Verify Otp state';
export class VerifyOtpClear implements Action {
  readonly type = VERIFY_OTP_CLEAR;

  constructor() {}
}

export const UPDATE_AUTH_MESSAGE = '[AUTH] Update Auth Message';
export class UpdateAuthMessage implements Action {
  readonly type = UPDATE_AUTH_MESSAGE;

  constructor(public message: string) {}
}

export const UPDATE_AUTH_REDIRECT = '[AUTH] Update Auth Redirect';
export class UpdateAuthRedirect implements Action {
  readonly type = UPDATE_AUTH_REDIRECT;

  constructor(public url: string) {}
}

export type All =
  | FetchUserInfo
  | FetchUserInfoSuccess
  | FetchUserInfoFailed
  | RegisterPhone
  | RegisterPhoneSuccess
  | RegisterPhoneFailed
  | RegisterPhoneClear
  | VerifyPhone
  | VerifyPhoneSuccess
  | VerifyPhoneFailed
  | VerifyPhoneClear
  | ResendCode
  | ResendCodeSuccess
  | ResendCodeFailed
  | RefreshUserData
  | FetchUserData
  | FetchUserDataSuccess
  | FetchUserDataFailed
  | SendUserData
  | SendUserDataSuccess
  | SendUserDataFailed
  | SendOtpCode
  | SendOtpCodeSuccess
  | SendOtpCodeFailed
  | SendPhoneForOtp
  | SendPhoneForOtpSuccess
  | SendPhoneForOtpFailed
  | SendPhoneForOtpClear
  | InitializeProfileState
  | ClearUserInfo
  | UpdateUserProfile
  | VerifyOtp
  | VerifyOtpSuccess
  | VerifyOtpFailed
  | VerifyOtpClear
  | RegisterUser
  | RegisterUserClear
  | UpdateAuthMessage
  | UpdateAuthRedirect;
