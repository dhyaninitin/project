import { Link, Meta, Pagination } from './common.model';
import { User } from './user.model';
import { Vehicle } from './vehicle.model';

export interface RequestFilter {
  start_date?: string;
  end_date?: string;
  location?: string;
  contact_owner?: number;
  year?: string;
  make?: string;
  model?: string;
  source?: string;
  referrals?: string;
  closedwon?: string;
  deal_stage_pipeline?: string;
}

export interface Filter {
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
}

export interface ExportFilter {
  type: string;
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
}

export interface ExportToken {
  token: string;
  type: string;
  filter: string;
  portal_user_id: number;
  expired_at: string;
  id: number;
}

export interface UserCarInterface {
  will_trade: number;
  brand_id: number;
  miles: number;
  model_id: number;
  term_in_months: number;
  down_payment: number;
  annual_milage: number;
  year: number;
}

export interface Preference {
  user_car_information: UserCarInterface;
  exterior_colors_oem: Array<string>;
  exterior_colors: Array<string>;
  credit_score: number;
  referral_code: string;
  buying_time: number;
  interior_colors: Array<string>;
  option_preferences: Array<string>;
  interior_colors_oem: Array<string>;
  is_not_complete: number;
  buying_method: number;
  vehicles: Array<number>;
  configuration_state_id: string;
  source_utm: number;
  user_id: number;
  is_complete: number;
}

export interface Request {
  id: number;
  first_name: string;
  last_name: string;
  year: number;
  brand: string;
  model: string;
  trim: string;
  price: number;
  order_number: string;
  request_time: string;
  credit_score: number;
  buying_time: number;
  buying_method: number;
  terms: string;
  referral_code: string;
  source_utm: string;
  is_complete: number;
  contact_owner: string;
  contact_owner_id: number;
  exterior_color: Array<string>;
  interior_color: Array<string>;
  options: Array<string>;
  user_id:string;
  deposit_status:string;
  credit_application_status:string;
  insurance_status:string;
  tradein_acv:string;
  send_tradein_form:string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  portal_deal_stage?:number | string;
  hubspot_deal_stage_pipeline_name?:string;
  deal_id?:string;
}

export interface UpdateRequest{
  deposit_status:string;
  credit_application_status:string;
  insurance_status:string;
  tradein_acv:string;
  send_tradein_form:string;
  portal_deal_stage?:number | string;
}
export interface Years {
  year: any;
}
export interface NewRequest {
  vehicle_id: string;
  user_id: string;
  dealstage_id: string;
  portal_deal_stage?:number | string;
}

export interface RequestResponse {
  data: Array<Request>;
  links: Link;
  meta: Meta;
}

export interface RequestYears {
  data: Array<any>;
  meta: Array<any>;
  error: null;
  statusCode: null;
  message: null;
}

export interface RequestQuoteLogFilter {
  page: number;
  per_page: number;
  targetIds: number[]
}

export interface Scrumboard {
  id:number;
  deal_stage: string;
  label: string;
  deals: ScrumboardList[];
  total_deals: number;
}

export interface ScrumboardList {
  id:number;
  user_id:number;
  deal_stage:string;
  first_name:string;
  last_name:string;
  trim:string;
  brand_name:string;
  models_name:string;
}

