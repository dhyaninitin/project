export interface ICustomRequest {
  readonly vehicle_type: number;
  readonly price_type: boolean;
  readonly buying_time: number;
  readonly buying_method: number;
  readonly min_price: number;
  readonly max_price: number;
  readonly referral_code: Array<string>;
  readonly credit_score: number;
}
