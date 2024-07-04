import { environment } from '../../../../../../environments/environment';
export class City {
  _id ?: string;
  countryId = '';
  stateId = '';
  city: string ;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
