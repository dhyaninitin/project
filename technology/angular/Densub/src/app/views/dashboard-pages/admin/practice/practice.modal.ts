import { environment } from '../../../../../environments/environment';

export class Practice {
    _id: any;
    practiceType: string;
    status: String = environment.STATUS.ACTIVE;
    createdAt?: string;
    updatedAt?: string;
}
