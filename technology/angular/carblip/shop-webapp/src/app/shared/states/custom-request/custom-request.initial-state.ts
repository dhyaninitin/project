import { ICustomRequest } from './custom-request.interface';

export function customRequestInitialState(): ICustomRequest {
  return {
    vehicle_type: null,
    price_type: false,
    buying_time: null,
    buying_method: null,
    min_price: null,
    max_price: null,
    referral_code: [],
    credit_score: null,
  };
}
