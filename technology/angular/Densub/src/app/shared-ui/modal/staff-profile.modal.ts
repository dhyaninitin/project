import { environment } from '../../../environments/environment';
import {  startOfDay, endOfDay} from 'date-fns';


const date = new Date('21 July 1947 14:48 UTC');

export class Education {
  schoolName: string;
  degreeEarned: string;
  yearsAttended: number;
  graduationYear: string = '';
}

export class License {
  state: string = '';
  licenseType: string = '';
  licenseNumber: number;
  expirationDate: any;
}

export class Calendar {
  _id?: string;
  startTime: number;
  endTime: number;
  start: Date;
  // title: string;
  day: number;
  status: string;
  toggleStatus: boolean;
  availableType: string;
  // available: boolean;
  userId?: String;
}


export class StaffProfile {
  _id: string;
  userType: string = environment.USER_TYPE.STAFF;
  firstName: string;
  middleName: string;
  lastName: string;
  profilePhoto: any = [];
  email: any;
  phone: number;
  bio: string;
  profileVerificationStatus: any = environment.PROFILE_STATUS.PENDING;
  avgRating: Number = 0;
 /*  skill = {
    ids: [],
    clinicalOther: '',
    administrationOther: '',
    softwaresOther: '',
  }; */
   /*    softwares : {
                    ids: [],
                    other: ''
      },
      clinical: {
        ids: [],
        other: ''
      },
      administration: {
        ids: [],
        other: ''
      } */
  isOlder: boolean;
  // isOlder:Boolean = true;
  certifications: any = [];
  specialty: any =  {
      ids: [],
      other: ''
  };
  positionType = '';
  experience = '';
  milesTravelRadius: any = '';
  desiredHourlyRate: any;
  emergencyContactName: string;
  emergencyContactNumber: number;
  educationDetails: Education[] = [];
  calendarType = 'generalCalendar';
  childAbuseHistory: boolean;
  hepCVaccination: boolean;
  covidVaccination: boolean;
  location?: any = {
    longitude : 0,
    latitude : 0
  };
  /* childAbuseHistory = false;
  hepCVaccination = false; */
  genCalAvailableDays: any = [
    { day: 'Sunday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
      endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Monday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Tuesday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Wednesday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Thursday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Friday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() },
    { day: 'Saturday', available: true, availableType: 'any', startTime: startOfDay(new Date(date)).getTime(),
    endTime: endOfDay(new Date(date)).getTime() }
  ];

  licensesDetails: License[] = [];
  showLicense: boolean =  false;
  // availableDays: any = [];
  resume: any = [];
  // proMalpracticeIns: any = [];
  expMalpracticeIns: boolean;
  expMalpracticeInsDate: any = '';
  stripeId?: String = '';

  // docs: any = [];
  // cprCertification: any = [];
  // moreCertifications: any = [];
  // genCalStartTime: String = '10:00 PM';
  // genCalEndTime: String = '10:00 PM';







}






/*
import { environment } from '../../../environments/environment';
export class StaffProfile {
  _id: String;
  firstName: String;
  lastName: String;
  profilePhoto: any = [];
  docs: any = [];
  email: any;
  phone: String;
  address: String;
  calendarType: any = 'generalCalendar';
  milesTravelRadius: any;
  positionType?: String = '';
  experience: String = '';
  skills: any = [];
  bio: string;
  licensesDetails: any = [
    {
      licensePhoto: '',
      expirationDate: '',
      licenseNumber: '',
      applicableState: ''
    }
  ];
  availableDays: any = [];
  resume: any = [];
  cprCertification: any = [];
  proMalpracticeIns: any = [];
  expMalpracticeInsDate: any = '';
  moreCertifications: any = [];
  desiredHourlyRate: any = 0;
  paypalEmail: String = '';
  userType: String = environment.USER_TYPE.STAFF;
  profileVerificationStatus: any = environment.PROFILE_STATUS.PENDING;
  location?: any = {
    longitude : 0,
    latitude : 0
  };
  genCalAvailableDays: any = [
    { day: 'Sunday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Monday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Tuesday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Wednesday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Thursday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Friday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' },
    { day: 'Saturday', available: true, availableType: 'any', startTime: '00:00', endTime: '00:00' }
  ];
  stripeId?: String = '';
  avgRating?: Number = 0;
}
*/
