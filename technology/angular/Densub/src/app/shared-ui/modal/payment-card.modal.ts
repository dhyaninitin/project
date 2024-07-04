import { environment } from '../../../environments/environment';

export const PaymentCard = {
    _id: '',
    customerId: '',
    createdAt: '',
    updatedAt: '',
    setAsPrimaryCard: false,
    email: '',
    cardId: '',
    cardNumber: '',
    CVV: '',
    month: '',
    year: '',
    paymentStatus: environment.STATUS.ACTIVE
}
