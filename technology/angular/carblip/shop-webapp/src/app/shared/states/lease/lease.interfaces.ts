import { IBrand } from '../brands/brands.interfaces';
import { IModel } from '../models/models.interfaces';

export interface ILease {
  readonly id: number;
  readonly user_id: number;
  readonly buying_time: number;
  readonly buying_method: number;
  readonly will_trade: number;
  readonly year: number;
  readonly brand_id: number;
  readonly model_id: number;
  readonly miles: number;
  readonly term_in_months: number;
  readonly down_payment: number;
  readonly annual_milage: number;
  readonly credit_score: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly Brand: IBrand;
  readonly Model: IModel;
}

export interface ILeaseGroup extends ILease {
  readonly fetching: boolean;
  readonly didFetch: boolean;
  readonly errors: Array<string>;
}
