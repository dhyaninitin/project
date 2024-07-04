import { environment } from '../../../../../../environments/environment';
export class Certificate {
  _id ?: string;
  certificate: string ;
  certificateType = '';
  status = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
