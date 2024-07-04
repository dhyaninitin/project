import { environment } from "../../../environments/environment";

export class PositionType {
  _id: String;
  name: string = '';
  amount: any;
  status: string = environment.STATUS.ACTIVE;
}
