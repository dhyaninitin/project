import { environment } from '../../../environments/environment';

export class Users {
  _id?: any;
  firstName: String;
  lastName: String;
  email: String;
  password: String;
  phone: String;
  status?: any = 1;
  emailVerificationStatus?: any = 1;
  profileVerificationStatus?: any = environment.PROFILE_STATUS.NEW;
  userType: String;
  accessLevelId?: String = '';
  positionType?: String = '';
  avgRating?: Number = 0;
  createdBy?: String;
  activated?:any= {
    "isActivated": 0,
    "expiryDate": Date,
  };
  // total?: any = {
  //   jobs : 0,
  //   hours : 0,
  //   staffHired : 0,
  //   cancelContract: 0,
  // };
  
}
