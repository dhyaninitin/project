import { environment } from '../../../environments/environment';

export class Filter {
  positionType: String = '';
  specialty: any = [];
  certificates: any = [];
  skills: any = [];
  childAbuse: boolean;
  minHourlyRate: Number;
  maxHourlyRate: Number;
  address: string;
  miles: Number = environment.DEFAULT_SEARCH_MILES;
  dates: any;
  sort: String = '';
  experience: String = '';
}
