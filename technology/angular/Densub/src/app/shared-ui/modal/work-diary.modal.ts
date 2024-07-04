import { environment } from '../../../environments/environment';
export class WorkDiary {
  _id?: String;
  date: any = '';
  startTime: any = '';
  endTime: any = '';
  breakTime: any = {
    hours: 0,
    minutes: 0
  };
  jobPostId: any;
  totalTime: any = {
    hours: 0,
    minutes: 0
  };
  contractId: String = '';
  totalAmount: Number = 0;
  paidStatus: String = environment.WORKDIARY_PAID_STATUS.PENDING;
  paidDate: String = '';
  practiceId: String = '';
  staffId: String = '';
  paymentDetails: any = {
    paymentType: environment.WORKDIARY_PAYMENT_TYPE.ONLINE,
    paymentDesc: '',
    paymentId: '',
  };
  offlinePyamentType:String= environment.OFFLINE_PAYMENT_TYPE.INPERSON;
  timeClockStatus: String;
  clockInTime: String;
  clockOutTime: String;
}
