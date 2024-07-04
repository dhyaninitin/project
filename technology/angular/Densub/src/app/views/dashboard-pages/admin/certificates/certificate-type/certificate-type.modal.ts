import { environment } from '../../../../../../environments/environment';
export class CertificateType {
  _id ?: string;
  certificateType: string ;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
