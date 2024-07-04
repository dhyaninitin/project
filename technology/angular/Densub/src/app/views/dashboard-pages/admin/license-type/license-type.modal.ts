import { environment } from '../../../../../environments/environment';
export class LicenseType {
  _id ?: String;
  licenseType: String ;
  positionType = '' ;
  status: String = environment.STATUS.ACTIVE;
  createdAt ?: String;
  updatedAt ?: String;
}
