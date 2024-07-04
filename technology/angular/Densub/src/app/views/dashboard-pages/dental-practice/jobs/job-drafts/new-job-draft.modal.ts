import { environment } from '../../../../../../environments/environment';
import * as moment from 'moment';

export class JobNewPost {
  _id?: any;
  jobType: any = environment.JOB_TYPE.TEMPORARY;
  jobTitle?: String = '';
  positionType?: any = '';
  location?: String = '';
  jobDates?: any = [];
  startTime?: any = '';
  endTime?: any = '';
  desiredHourlyRate?: any = 0;
  jobDate?: any = '';
  experience?: String = '';
  pervalue?: any = 0;
 // ratePerValue?: any = '';
  description?: String = '';
  status?: String = environment.JOB_STATUS.OPEN;
  durationHour?: String;
  skills?: any = [];
  visibility?: String = environment.JOB_VISIBILITY.PUBLIC;
  createdBy: String;
  availableDays: any = [
    { day: 'Sunday', available: true, availableInfo: '' },
    { day: 'Monday', available: true, availableInfo: '' },
    { day: 'Tuesday', available: true, availableInfo: '' },
    { day: 'Wednesday', available: true, availableInfo: '' },
    { day: 'Thursday', available: true, availableInfo: '' },
    { day: 'Friday', available: true, availableInfo: '' },
    { day: 'Saturday', available: true, availableInfo: '' }
  ];
  activeMonth: any = '1';
  activeMonthRate: any = 50;
}
