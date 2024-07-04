import { environment } from '../../../environments/environment';
export class Notification {
  id?: String;
  // name: String = 'Prakhar';
  // title?: String;
  type?: String; // newPost / bidReceived / bidAccept/ bidDecline
  subType?: String; // offerReceived / offerSent
  senderId?: String;
  receiverId?: String;
  message?: String;
  redirectLink?: String;
  staff?: any;
  practice?: any;
  status?: String = environment.notificationStatus.UNREAD; // unread /Read / delete
  createdAt?: Number;
  updatedAt?: Number;
  typeId?: String; // Remove when database gets clear
  jobId?: String;
  offerId?: String;
}
