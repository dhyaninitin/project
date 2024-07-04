import { environment } from '../../../../../environments/environment';
export class Experience {
  _id ?: String;
  experience ?: String;
  type?: String[];
  status: String = environment.STATUS.ACTIVE;
  createdBy ?: String;
  updatedBy ?: String;
}
