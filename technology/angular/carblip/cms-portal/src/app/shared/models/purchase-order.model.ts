import { Link, Meta, Pagination } from './common.model';

export interface PurchaseOrder {
  id?: number;
  purchase_order_number?:number;
  quote_id?: string;
  vendor_id?: string;
  vendor_contact_id?: string;
  amount?: number;
  description?: string;
  request_approval_from?: string;
  approved?: boolean;
  payment_date?: string;
  selected?:boolean;
  category ?: string;
  created_at?: string;
  updated_at?: string;
  wholesale_id?:string;
}

//state interface
 export interface PurchaseOrderState{
   id:string;
   name:string;
   value:string;
 }

export interface PurchaseOrderResponse {
  data: Array<PurchaseOrder>;
  links: Link;
  meta: Meta;
}

export interface History{
  id?: number;
  category?: number | string;
  content?: string;
  is_read?: number;
  is_view?: number;
  action?: string;
  target_id?: number;
  target_type?: string;
  portal_user_id?: number;
  portal_user_name?:string
  created_at?: string;
  updated_at?: string;
}