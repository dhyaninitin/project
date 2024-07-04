import { environment } from '../../../environments/environment';

export class Offer {
  _id?: any;
  jobPostId: String;
  practiceId: String;
  staffId: String;
  status: String = environment.OFFER_STATUS_NEW.OFFER;
  isApplyied : Boolean = false;
  offerSteps?: any = {
    initial: {message: '', amount: 0, offerBy: '', offerTime: '', startTime: '', endTime: ''},
    counter: {message: '', amount: 0, offerBy: '', offerTime: '', startTime: '', endTime: ''},
    recounter: {message: '', amount: 0, offerBy: '', offerTime: '', startTime: '', endTime: ''},
    final:   {message: '', amount: 0, offerBy: '', offerTime: '', startTime: '', endTime: ''}
  };
  // Note :- StartTime and EndTime only in case when offered by staff
  offerStatus?: String = environment.OFFER_TYPE.INITIAL;
  // staffOfferTime?: any;
  // practiceOfferTime?: any;
  revokeTime?: any;
  contractStartTime?: any;
  practiceName: String;
  // contractEndTime?: any;
  offerDecline?: any = { reason: '', declineTime: '', declineBy: ''};  
  finalRate?: number;
  contractStatus?: String;
  isContractRead?: Boolean = false;
  sendOfferByPractice?: Boolean = false;  /// Used when practiner sends the offer
  paymentId?: String;
  isPayment?:boolean;
  cancelContract?: any = {reason: '' , cancelTime: '' , cancelBy: ''};
  endContract?: any = {endTime: '' , endBy: ''};
}





