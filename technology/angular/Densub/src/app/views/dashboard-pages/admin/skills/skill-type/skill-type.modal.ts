import { environment } from '../../../../../../environments/environment';

export class SkillType {
  _id ?: string;
  skillType: string ;
  status: string = environment.STATUS.ACTIVE;
  createdAt ?: string;
  updatedAt ?: string;
}
