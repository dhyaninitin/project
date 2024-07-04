export interface IProfile {
  readonly id: number;
  readonly first_name: string;
  readonly last_name: string;
  readonly gender: string;
  readonly date_of_birth: number;
  readonly email_address: string;
  readonly password: number;
  readonly facebook_id: number;
  readonly device_token: string;
  readonly device_type: string;
  readonly access_token: number;
  readonly otp: number;
  readonly phone: string;
  readonly phone_verified: boolean;
  readonly status: number;
  readonly zipcode: null;
  readonly location: null;
  readonly login_verify_code: string;
  readonly lease_captured: boolean;
}

export interface IAuthGroup {
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly profileResult: any;
  readonly errors: Array<string>;
  readonly user: IProfile;
  readonly emailCheckResult: any;
  readonly registerPhoneResult: any;
  readonly verifyPhoneResult: any;
  readonly verifyOtpResult: any;
  readonly phonenoResult: any;
  readonly optCodeResult: any;
  readonly registerUser: string;
  readonly authMessage: string;
  readonly authRedirect: string;
}

export class UserInfo {
  first_name?: string;
  email?: string;
  phone?: string;
}
