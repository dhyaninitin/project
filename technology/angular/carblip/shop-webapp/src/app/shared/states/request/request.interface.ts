export interface IUserCarInformation {
  readonly will_trade: number;
  readonly year: number;
  readonly brand_id: number;
  readonly model_id: number;
  readonly miles: number;
  readonly term_in_months: number;
  readonly down_payment: number;
  readonly annual_milage: number;
}

export interface IRequest {
  readonly buying_time: number;
  readonly buying_method: number;
  readonly referral_code: Array<string>;
  readonly credit_score: number;
  readonly is_not_complete: number;
  readonly user_car_information: IUserCarInformation;
}
