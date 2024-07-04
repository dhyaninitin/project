import { environment } from '../../../../../environments/environment';
export class Specialty {
  _id ?: string;
  specialty ?: string;
  positionType ?: string[];
  // showInput = false;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
