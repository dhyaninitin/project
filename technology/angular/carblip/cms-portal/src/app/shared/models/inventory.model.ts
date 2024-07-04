import { Link, Meta, Pagination } from './common.model';

export interface InventoryFilter {
  dealer?: number;
  year?: number;
  make?: number;
  model?: number;
  trim?: number;
}

export interface Filter {
  search?: string;
  filter?: InventoryFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
}

export interface Inventory {
  id: number;
  desc: string;
  dealer?: string;
  make?: string;
  model?: string;
  year?: number;
  is_new?: number;
  msrp?: number;
  model_number?: string;
  year_display?: string;
  base_msrp?: number;
  invoice?: number;
  price?: number;
  current_mileage?: number;
  exterior_color?: string;
  interior_color?: string;
  lot_age?: number;
  stock_no?: string;
  vin?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryResponse {
  data: Array<Inventory>;
  links: Link;
  meta: Meta;
}
