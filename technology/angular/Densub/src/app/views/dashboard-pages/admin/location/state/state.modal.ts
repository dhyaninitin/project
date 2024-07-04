import { environment } from '../../../../../../environments/environment';
export class State {
  _id ?: string;
  countryId = '';
  state: string ;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
