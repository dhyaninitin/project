import { environment } from '../../../environments/environment';

export class Filter {
  positionType: String = '';
  jobType: String = '';
  address: String;
  miles: Number = environment.DEFAULT_SEARCH_MILES;
  jobdates: any;
  location: Location;
  practiceType: String = '';
  accountType: String = ''
  compensationType: String = '';
  empType: String = '';
  radiograph: String = '';
  recordMaintained: String = '';
  specialty: any = [];
  certificates: any = [];
  skills: any = [];
  benefits: any = [];
  childAbuse: Boolean = false;
  sameDayPay: Boolean = false;
  remoteWork: boolean = false;
  ePay: Boolean = false;
  practiceName: String = '';
  ppe: String = '';
  softwares: any = [];
  otherRadiograph: String = '';
  leftHandedAccomodation : Boolean = false;
  minHourlyRate : String = '';
  maxHourlyRate : String = '';
  minSalaryRate: String = '';
  maxSalaryRate: String = '';
  commission: boolean = false;
  performanceBonus: boolean = false;
  signOnBonus: boolean = false;
  bonusTemp: boolean = false;
  desiredHourlyRate: String = '0';
  sort: String = '';
  experience: String = '';
  allJobDatesSelected: Boolean = true;
}


//  https://fetrarij.github.io/ngx-daterangepicker-material/simple
