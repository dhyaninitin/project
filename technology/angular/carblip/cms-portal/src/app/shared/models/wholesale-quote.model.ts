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
  wholesale_stock_no?: string;
  sale_date?: string;
  wholesale_sale_id?: number;
  newcar_sale_id?: number;
  dealer_id?: string;
  dealer_info?: object;
  dealer_contact_id?: string;
  quote_id?: number;
  sold_to?: string;
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
  client_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  auction_fee?: number;
  purchase_order_id?: string;
  purchaseOrderList?: Array<PurchaseOrderList>;
  purchase_order_ids?: Array<PurchaseOrderList>;
  customersWholeSale?: Array<CustomersWholeSale>;
  purchase_order_description?: string;
  purchase_order_amount?: number;
  sale_amount?: number;
  mmr?: number;
  allowance_from?: number;
  payoff_amount?: number;
  paid_by?: string;
  title_payoff_date?: string;
  title_receive_date?: string;
  allowance_to_new?: number;
  check_to_client?: number;
  check_to_client_at?: string;
  check_to_dealer?: number;
  gross_profit?: number;
  repairs?: number;
  net_amount?: number;
  wholesale_commission?: number;
  pack_fee?: number;
  newcar_commission?: number;
  company_net?: number;
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
  notes?: string;
  newCarAllowance?: Array<NewCarAllowance>;
  sales_tax?:number;
  mark_as_final?:number;
}

export interface WholesaleQuote extends BaseQuote {
  id?: number;
  request_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewWholesaleQuote {
  user_id?: number;
  data?: BaseQuote;
}

export interface WholesaleQuoteResponse {
  data?: Array<WholesaleQuote>;
  links?: Link;
  meta?: Meta;
}
export interface History {
  id?: number;
  category?: number | string;
  content?: string;
  is_read?: number;
  is_view?: number;
  action?: string;
  target_id?: number;
  target_type?: string;
  portal_user_id?: number;
  portal_user_name?: string
  created_at?: string;
  updated_at?: string;
}

export interface NewCarAllowance {
  quote_id?: string;
  allowance_to_new?: number;
}

export interface Filter {
  search?: string;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
  filter?: WholesaleQuoteFilter;
}

export interface WholesaleQuoteFilter {
  sale_start_date?: string;
  sale_end_date?: string;
  location?: string;
  salesperson?: string;
  newcarsalesperson?: string;
  year?: string;
  make?: string;
  model?: string;
  final?:number;
}