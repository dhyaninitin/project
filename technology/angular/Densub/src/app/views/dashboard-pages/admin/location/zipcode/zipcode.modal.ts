import { environment } from '../../../../../../environments/environment';
export class Zipcode {
  _id ?: string;
  countryId = '' ;
  stateId = '';
  cityId = '';
  zipcode: string ;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
