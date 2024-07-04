import { environment } from '../../../environments/environment';
export class Rating {
  _id?: String;
  staffId?: String;
  practiceId?: String;
  contractId?: String;
  rating: Number = 5;
  type?: String;   // Job/Staff
  status?: String = environment.RATING_STATUS.PENDING; // pending/done
  ratedBy?: String = '';
}
