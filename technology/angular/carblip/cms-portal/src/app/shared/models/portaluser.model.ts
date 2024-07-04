import { Link, Meta, Pagination } from './common.model';
import { Location } from './location.model';
import { Log } from './log.model';

/**
 * User Permission Interface
 */
export interface Permission {
  id: number;
  name: string;
}

/**
 * User Role Interface
 */
export interface Role {
  id: number;
  name: string;
}

/**
 * PortalUser Interface for post, put request
 */
export interface UpdatePortalUser {
  name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  personalemail?: string;
  phone?: string;
  role_id?: number;
  location_id?: number;
  promo_code?:string;
  roundrobin?: boolean;
  password?: string;
  password_confirmation?: string;
  tiktok_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  discord_url?: string;
  is_active?: boolean;
  is_reset_password_required?: number;
  city?:string;
  state?:string;
  sales_license_expiry_date?:Date;
  carblip_assigned_phone?:string;
}

/**
 * PortalUser Interface
 */
export interface PortalUser {
  id?: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  roles?: Array<Role>;
  permissions?: Array<Permission>;
  location: Location;
  promo_code:string;
  tiktok_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  discord_url?: string;
  phone?: string;
  carblip_assigned_phone?: string;
  email: string;
  personalemail?: string;
  password?: string;
  roundrobin?: boolean;
  is_active?: boolean;
  is_reset_password_required?: number;
  created_at?: string;
  updated_at?: string;
  city?:string;
  state?:string;
  sales_license_expiry_date?:Date;
  areacode?:string;
  contains?:string;
  last_active?: string;
}

/**
 * PortalUser Response Interface
 */
export interface PortalUserResponse {
  data: Array<PortalUser>;
  links: Link;
  meta: Meta;
}

export interface RequestFilter {
  roles?: string;
  isactive?: string;
  isinactive?: string;
  isroundrobin?: string;
}

export interface Filter {
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
}
