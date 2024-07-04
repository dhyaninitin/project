import { ILease } from './lease.interfaces';

export function leaseInitialState(lease: ILease): ILease {
  const emptyObj: ILease = {
    id: 0,
    user_id: 0,
    buying_time: null,
    buying_method: null,
    will_trade: null,
    year: null,
    brand_id: null,
    model_id: null,
    miles: null,
    term_in_months: null,
    down_payment: null,
    annual_milage: null,
    credit_score: null,
    created_at: null,
    updated_at: null,
    Brand: null,
    Model: null,
  };

  return { ...emptyObj, ...lease };
}
