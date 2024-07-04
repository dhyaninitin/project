import { environment } from '../../../environments/environment';
import {  startOfDay, endOfDay} from 'date-fns';

const date = new Date('21 July 1947 14:48 UTC');
export class JobNewPost {
  _id?: any;
  jobType: any = environment.JOB_TYPE.TEMPORARY;
  jobTitle?: String = '';
  positionType?: any = '';
  location?: String = '';
  jobDates?: any = [];
  startTime: any = startOfDay(new Date(date)).getTime();
  endTime?: any = endOfDay(new Date(date)).getTime();
  desiredHourlyRate?: Number;
  desiredSalaryRate?: Number;
  practiceName: string = '';
  practice : String = '';
  employmentType : boolean = true;
  covidVaccine: boolean;
  childAbuse: boolean;
  hepC: boolean;
  malpractice: boolean;
  experienceType: Boolean;
  sameDayPay: boolean = true;
  availablePayOpt: boolean = true;
  negotiate: boolean = false;
  commission: boolean = false;
  commissionRate: String;
  bonus: boolean = false;
  bonusRate: Number;
  hoursPerWeek: Number;
  benefits?: any = [];
  // desiredSalaryRate?: Number = 0;
  jobDate?: any = '';
  experience?: String = '';
  payCycle?: String = ''
  pervalue?: any = 0;
  signOnBonus: Number;
  offerBonus: boolean = true;
 // ratePerValue?: any = '';
  description?: String = '';
  status?: String = environment.JOB_STATUS.OPEN;
  // durationHour?: String;
  requiredSkills?: any = [];
  preferredSkills?: any = [];
  preferredSpecialities?: any = [];
  preferredCertificates?: any = [];
  requiredSpecialities?: any = [];
  requiredCertificates?: any = [];
  otherLanguages: any = [];
  visibility?: String = environment.JOB_VISIBILITY.PUBLIC;
  createdBy: String;
  availableDays: any = [
    { day: 'Sunday', available: true,flexible: false, availableInfo: '' , startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Monday', available: true, flexible: false, availableInfo: '' ,startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Tuesday', available: true,flexible: false, availableInfo: '',startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Wednesday', available: true, flexible: false, availableInfo: '', startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Thursday', available: true, flexible: false, availableInfo: '', startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Friday', available: true, flexible: false, availableInfo: '', startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()},
    { day: 'Saturday', available: true, flexible: false, availableInfo: '', startTime: startOfDay(new Date(date)).getTime(),endTime: endOfDay(new Date(date)).getTime()}
  ];
  activeMonth: any = '1';
  activeMonthRate: any = 50;
  promocodeDiscount: Number = 0;
  expireDate: any = '';
  locationLatLng?: any = {
    longitude : 0,
    latitude : 0
  };
  // bidCount = 0;
  // offerCount = 0; // delete in future
  draft = false;
  stayAsDraft = false;
  paymentMethod = environment.PAYEMENT_METHOD.HOURLY;
  paymentId?: String;
  total = {            // From Practice Side
    sentStaffOffers: 0,
    // interviewOpen: 0,
    sentPracticeOffers: 0
  };
  contractId?: string;
}





