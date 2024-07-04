import { Permission, Role } from './portaluser.model';
import { PortalUser } from './portaluser.model';
import { Link, Meta, Pagination } from './common.model';
import { Location } from './location.model';
import { Request } from './request.model';


/**
 * User list filters 
 */
 export interface RequestFilter {
  start_date?: string;
  end_date?: string;
  first_name?: string;
  last_name?: string;
  phone?: number;
  source?: string;
  created_by?: number;
  contact_owner?: number;
  type?: number;
}

export interface Filter {
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
}

/**
 * User Profile Interface
 */
export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  personalemail?: string;
  phone: number;
  profile_url: string;
  tiktok_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  discord_url?: string;
  is_reset_password_required?: number;
  location: Location;
  permissions: Array<Permission>;
  roles: Array<Role>;
  created_at: string;
  updated_at: string;
  two_factor_slider?:number;
  two_factor_option?:number;
  secretkey?: string;
  is_verify?:number;
}

/**
 * User Interface for post, update request
 */
export interface UpdateProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  tiktok_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  discord_url?: string;
  profile_name?: string;
  profile_path?: string;
  personalemail?: string;
  password?: string;
  password_confirmation?: string;
}

/**
 * User Interface for post, update request
 */
export interface UpdateUser {
  name: string;
  first_name: string;
  last_name: string;
  contact_owner_email?: string;
  password?: string;
  password_confirmation?: string;
}

/**
 * User Interface
 */
export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  email_address: string;
  contact_owner?: string;
  contact_owner_email?: string;
  password?: string;
  phone?: string;
  phone_verified?: number;
  app_version?: string;
  device_type?: string;
  lease_captured?: number;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  portal_user?: PortalUser;
  requests?: Array<Request>;
  phone_preferred_contact?: number;
  phone_preferred_time?: string;
  phone_preferred_type?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  source?: string | number;
  type?:number;
  concierge_state?:string;
  over18?:number;
  linkedin_profile?:string;
  concierge_source?:string;
  interview_scheduled?:string;
  sales_license_status?:string;
  sales_license?:string;
  intake_questionaire_1?:string;
  intake_questionaire_2?:string;
  intake_questionaire_3?:string;
  w2_sgned_date?:string;
  onboarded_date?:string;
  works_at_dealership?:string;
  physical_sales_license_received?:string;
  fico_score?:string;
  hhi?:string;
  sex?:string;
  contacts_engagement_count?: number;
  concierge_referral_url?: string;
  close_date?: string;
  opted_out_email_important_update?: number;
  opted_out_email_marketing_information?: number;
  opted_out_email_one_to_one?: number;
  secondary_emails?: UserSecondaryEmails[];
  secondary_phone?: UserSecondaryPhones[];
  contact_id?: number;
}

/**
 * Authenticated User Response Interface
 */
export interface AuthUserResonse {
  data: Profile;
}

/**
 * User List Response Interface
 */
export interface UserResponse {
  data: Array<User>;
  links: Link;
  meta: Meta;
}

export interface ExportFilter {
  type: string;
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
}
export interface UserSecondaryEmails {
  id?: number;
  email: string;
  is_primary: boolean;
}

export interface UserSecondaryPhones {
  phone: string;
  is_primary: boolean;
}

export interface ExportFilter {
  type: string;
  search?: string;
  filter?: RequestFilter;
  order_by?: string;
  order_dir?: string;
}
