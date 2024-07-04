import { Link, Meta, Pagination } from './common.model';


export interface Filter {
    search?: string;
    order_by?: string;
    order_dir?: string;
    page: number;
    per_page: number;
  }

  export interface Year {
    sort(arg0: (a: any, b: any) => 1 | -1): Year[];
    id: number;
    year: string;
    is_active: number;
    is_default: number;
    is_scrapable: number;
    is_new: number;
    created_at:string;
    updated_at:string;
  }

  export interface Response {
    data: Array<Year>;
    links: Link;
    meta: Meta;
  }

  export interface Brand {
    id: number;
    name: string;
    image_url:string;
    is_active:number;
    years:Array<any>;
    created_at:string;
    updated_at:string;
  }

  export interface BrandFilter {
    search?: string;
    order_by?: string;
    order_dir?: string;
    page: number;
    per_page: number;
  }

  export interface BrandResponse {
    data: Array<Brand>;
    links: Link;
    meta: Meta;
  }

  export interface ModelFilter {
    brand?:number;
    year?:number;
    // search?: string;
    // order_by?: string;
    // order_dir?: string;
    // page: number;
    // per_page: number;
  }

  export interface Model {
    id: number;
    brand_id: number;
    sub_brand_id:number;
    name: string;
    image_url_320: string;
    image_url_640:string;
    image_url_1280: string;
    image_url_2100: string;
    year:number;
    msrp: number;
    data_release_date: string;
    initial_price_date:string;
    data_effective_date: string;
    comment: string;
    is_new:number;
    created_at:string;
    updated_at:string;
  }

  export interface ModelResponse {
    data: Array<Model>;
    links: Link;
    meta: Meta;
  }

  export interface Trim {
    id: number;
    brand_id: number;
    model_id:number;
    model_no: string;
    trim:string;
    price:number;
    friendly_model_name:string;
    friendly_style_name:string;
    friendly_drivetrain:string;
    friendly_body_type:string;
    base_invoice:number;
    destination:number;
    year:number;
    image_url:string;
    image_url_320: string;
    image_url_640:string;
    image_url_1280: string;
    image_url_2100: string;
    media_status:number;
    media_update_at:string;
    is_supported:number;
    is_active:number;
    is_new:number;
    created_at:string;
    updated_at:string;
  }

  export interface TrimFilter {
    brand?:number;
    year?:number;
    model?:number;
    // search?: string;
    // order_by?: string;
    // order_dir?: string;
    // page: number;
    // per_page: number;
  }

  export interface TrimResponse {
    data: Array<Trim>;
    links: Link;
    meta: Meta;
  }