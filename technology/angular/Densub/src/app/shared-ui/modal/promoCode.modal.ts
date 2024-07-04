export class PromoCode {
  _id?: String;
  code?: String;
  // type?: String;
  title?: String;
  sendUserIds?: any = [];
  usedUserIds?: any = [];
  percentage?: Number = 0;
  expireDate?: any = '';
  token?: String = '';
}
