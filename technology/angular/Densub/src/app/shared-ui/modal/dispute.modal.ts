import { environment } from '../../../environments/environment';

export class Dispute {
  _id?: any;
  reason: String = '';         // Dispute reason
  detail: String;         // Dispute details
  contractId: String;    // Contract/Bid  id
  disputeUserId: String;   // User who added dispute
   status: String;   // Dispute Status
}





