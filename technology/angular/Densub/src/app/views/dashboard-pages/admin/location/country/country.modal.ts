import { environment } from '../../../../../../environments/environment';
export class Country {
  _id ?: string;
  country: string;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
