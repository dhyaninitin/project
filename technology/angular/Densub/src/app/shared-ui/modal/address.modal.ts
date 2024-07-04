import { environment } from '../../../environments/environment';

export class Address {
  _id?: string;
  addressLine_1: string;
  addressLine_2?: string;
  country = '';
  state = '';
  city = '';
  zipcode = '';
  practiceName?: string;
  practiceType = '';
  userType: string;
  userId: string;
  location?: Location = {
    lng : 0,
    lat : 0
  };
  status: string = environment.STATUS.ACTIVE;

  providedPPE?: string;
  recordMaintained = '' ;
  adultProphy?: string = '';
  childProphy?: string = '';
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
  };

}

interface Location {
    lng: number;
    lat: number;
}
