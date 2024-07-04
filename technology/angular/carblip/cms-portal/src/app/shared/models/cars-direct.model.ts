import { Link, Meta, Pagination } from './common.model';

export interface CarsDirectFilter {
  start_date?: string;
  end_date?: string;
  location?: string;
  contact_owner?: number;
}

export interface Filter {
  search?: string;
  filter?: CarsDirectFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
}

export interface CarsDirect {
  id: number;
  cars_direct_id:string;
  request_date:string;
  vehicle_interest:string;
  vehicle_status:string;
  vehicle_id:string;
  source:string;
  year: number;
  make:string;
  model: string;
  trim: string;
  exterior_colors:string;
  interior_colors:string;
  preference:string;
  invoice:number;
  msrp:number;
  quote:number;
  finance_method:string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email:string;
  email_preferred_contact:string;
  phone:string;
  phone_preferred_contact:string;
  phone_preferred_time:string;
  phone_preferred_type:string;
  street:string;
  apartment:string;
  city:string;
  regioncode:string;
  postalcode:number;
  timeframe:string;
  vendor:string;
  provider_id:number;
  provider_source:string;
  provider_name:string;
  provider_service:string;
  provider_url:string;
  created_at: string;
  updated_at: string;
}

export interface CarsDirectResponse {
  data: Array<CarsDirect>;
  links: Link;
  meta: Meta;
}