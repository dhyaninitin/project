import { environment } from '../../../../environments/environment';
export class Register {
  firstName: String;
  middleName: String;
  lastName: String;
  email: any;
  password: String;
  confPassword: String;
  userType: any = environment.USER_TYPE.PRACTICE;
  positionType?: String = '';
  status: any = 1;
  emailVerificationStatus: any = 0;
  profileVerificationStatus: any = environment.PROFILE_STATUS.NEW;
  // profileVerificationStatus: any = environment.PROFILE_STATUS.PENDING;
  termsConditions: Boolean = false;
  socialProvider?: String = '';
  profilePhoto?: String = '';
  socialId?: String = '';
}


interface Name {
  first: String;
  middle: String;
  last: String;
};
