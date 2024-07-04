import { Link, Meta, Pagination } from './common.model';

export interface Vendors {
  id?: number;
  name?:string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: number;
  website?: string;
  company_phone?: string;
  created_at?: string;
  updated_at?: string;
}

//state interface
 export interface VendorsState{
   key:string;
   value:string;
 }

export interface VendorsResponse {
  data: Array<Vendors>;
  links: Link;
  meta: Meta;
}

//vendor contact
export interface VendorContact {
  id?: number;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  rhs?:number;
  target_id?:number;
  target_type?:string;
  created_at?: string;
  updated_at?: string;
}

export interface NewVendorContact extends VendorContact {
  vendor_id: string;
}