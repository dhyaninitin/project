import { Link, Meta, Pagination } from './common.model';

export interface CustomersWholeSale {
  amount?: number;
  paid_to?: number;
  date?: string;
  payment_type?: number;
}

export interface ExpenseChargedClient {
  item?: string;
  charge?: number;
}

export interface ExpenseChargedDealer {
  item?: string;
  charge?: number;
}

export interface ExpenseVendor {
  name?: string;
  po_number?: string;
  amount?: number;
}

export interface PurchaseOrderList {
  vendor?: string;
  purchase_order_id?: number;
  amount?: number;
  description?: string;
}

export interface BaseQuote {
  stock_no?: string;
  portal_user_id?: string;
  portal_user?: object;
  dealer_id?: string;
  dealer_info?: object;
  dealer_contact_id?: string;
  purchase_order_id?:string;
  purchaseOrderList?: Array<PurchaseOrderList>;
  purchase_order_ids?:Array<PurchaseOrderList>
  vendor?:string;
  purchase_order_description?:string;
  purchase_order_amount?:number;
  dealer_contact_info?: object;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contract_date?: string;
  year?: string;
  make?: string;
  model?: string;
  dealer?: string;
  delivery_date?: string;
  vin?: string;
  business_manager?: string;
  drive_off?: number;
  notes?: string;
  allowance_wholesale?: number;
  year_wholesale?: string;
  make_wholesale?: string;
  model_wholesale?: string;
  lead?: string;
  vin_wholesale?: string;
  type_wholesale?: number;
  notes_wholesale?: string;
  customersWholeSale?: Array<CustomersWholeSale>;
  total_customer_payment?: number;
  expenseChargedClient?: Array<ExpenseChargedClient>;
  expenseChargedDealer?: Array<ExpenseChargedDealer>;
  allowance_chargedclient?: number;
  remaining_payments_chargedclient?: number;
  payment_chargedclient?: number;
  total_payment_chargedclient?: number;
  total_chargedclient?: number;
  total_chargeddealer?: number;
  expenseVendor?: Array<ExpenseVendor>;
  total_expensevendor?: number;
  brokeer_fee_dealer_expensevendor?: number;
  brokeer_fee_customer_expensevendor?: number;
  paid_by_expensevendor?: number;
  adds_expensevendor?: number;
  gross_expensevendor?: number;
  expense_actual_expensevendor?: number;
  pack_expensevendor?: number;
  net_expensevendor?: number;
  net_deal_expensevendor?: number;
  comission_percent_expensevendor?: number;
  comission_amount_expensevendor?: number;
  company_net_expensevendor?: number;
  invoice_dealer_expensevendor?: number;
  invoice_client_expensevendor?: number;
  check_to_dealer_expensevendor?: number;
  dealer_date_paid_expensevendor?: string;
  dealer_check_number_expensevendor?: number;
  check_to_client_expensevendor?: number;
  client_date_paid_expensevendor?: string;
  client_check_number_expensevendor?: number;
  tax_rate?: number;
  license_fee?: number;
  profit_due?: number;
  user_id?: string;
  delivery_or_pickup?: number, //new fields 
  msrp?:number,
  maturity_date?:Date,
  mileage_allotment?:string,
  monthly_payment?:number,
  residual_value?:string,
  sale_price?:number,
  term?:string;
  sales_tax?:number;
  mark_as_final?:number;
}

export interface Quote extends BaseQuote {
  id?: number;
  request_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewQuote {
  request_id?: string;
  data?: BaseQuote;
}

export interface QuoteResponse {
  data?: Array<Quote>;
  links?: Link;
  meta?: Meta;
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

export interface Filter {
  search?: string;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
  filter?: QuotesFilter;
}

export interface QuotesFilter {
  contract_start_date?: string;
  contract_end_date?: string;
  delivery_start_date?: string;
  delivery_end_date?: string;
  location?: string;
  salesperson?: string;
  year?: string;
  make?: string;
  model?: string;
  final?:number;
}