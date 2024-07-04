import { Link, Meta, Pagination } from './common.model';
import { User } from './user.model';

// Interface for Brand
export interface Brand {
  id: number;
  name: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for Model
export interface Model {
  id: number;
  name: string;
  brand_id?: number;
  sub_brand_id?: number;
  image_url?: string;
  image_url_320?: string;
  image_url_640?: string;
  image_url_1280?: string;
  image_url_2100?: string;
  year?: number;
  msrp?: number;
  data_release_date?: string;
  initial_price_date?: string;
  data_effective_date?: string;
  comment?: string;
  is_new?: number;
  is_enable?: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for Vehicle
export interface Vehicle {
  id: number;
  brand_id?: number;
  model_id?: number;
  trim: string;
  price?: number;
  friendly_model_name?: string;
  friendly_style_name?: string;
  friendly_drivetrain?: string;
  friendly_body_type?: string;
  base_invoice?: number;
  destination?: number;
  year?: number;
  image_url?: string;
  image_url_320?: string;
  image_url_640?: string;
  image_url_1280?: string;
  image_url_2100?: string;
  media_status?: number;
  media_update_at?: string;
  is_supported?: number;
  is_new?: number;
  created_at?: string;
  updated_at?: string;
  brand?: Brand;
  model?: Model;
}

export interface Trim {
  id: number;
  brand_id: number;
  model_id?: number;
  model_no?: string;
  trim: string;
  price: number;
  friendly_model_name?: string;
  friendly_style_name?: string;
  friendly_drivetrain: string;
  friendly_body_type: string;
  base_invoice?: number;
  destination?: number;
  year?: number;
  image_url?: string;
  image_url_320?: string;
  image_url_640?: string;
  image_url_1280?: string;
  image_url_2100?: string;
  media_status?: number;
  media_update_at?: string;
  is_supported?: string;
  is_active?: string;
  is_new?: number;
  is_enable?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DealStage {
  pipeline: string;
}
