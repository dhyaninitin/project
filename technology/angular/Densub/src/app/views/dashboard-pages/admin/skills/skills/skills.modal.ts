import { environment } from '../../../../../../environments/environment';

export class Skill {
    _id: any;
    skill: string;
    skillType = '';
    status: String = environment.STATUS.ACTIVE;
    // showInput = false;
    createdAt?: string;
    updatedAt?: string;
}
