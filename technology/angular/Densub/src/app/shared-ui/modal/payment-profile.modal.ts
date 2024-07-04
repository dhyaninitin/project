import { environment } from '../../../environments/environment';

export class PaymentProfile {
    _id?: string;
    customerId: string;
    createdAt?: string;
    updatedAt?: string;
    setAsPrimaryCard: boolean = false;
    paymentStatus: string = environment.STATUS.ACTIVE;
    paymentVerificationStatus = environment.PROFILE_STATUS.NEW;
    email: string;
    cardId: string
}
