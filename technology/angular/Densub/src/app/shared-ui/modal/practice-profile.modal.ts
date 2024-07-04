import { environment } from '../../../environments/environment';

export class PracticeProfile {
  _id: string;
  userType = environment.USER_TYPE.PRACTICE;
  firstName: string;
  middleName: string;
  lastName: string;
  companyName: string;
  profilePhoto: any = [];
  email: string;
  phone: number;
  bio: string;
  websiteUrl: any;
  profileVerificationStatus = environment.PROFILE_STATUS.PENDING;
  avgRating: Number = 0;
  accountType: string;
  practiceAccount: String;
  /* providedPPE: string;
  recordMaintained = '' ;
  adultProphy: string;
  childProphy: string;
  leftHandedAccomodation = false;
  radiograph = {
      id: '',
      other: ''
  };
  skill = {
    ids: [],
    clinicalOther: '',
    administrationOther: '',
    softwaresOther: '',
  }; */
  isOlder: boolean;
  // isOlder = true;
}

interface Name {
  first: string;
  middle: string;
  last: string;
}

