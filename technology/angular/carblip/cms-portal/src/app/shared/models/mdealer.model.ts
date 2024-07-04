import { Link, Meta, Pagination } from './common.model';

export interface MDealer {
  id: number;
  name: string;
  accont_type?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  monthly_fee?: number;
  is_active?: number;
  api_status?: number;
  m_activated_at?: string;
  m_beta_end_at?: string;
  m_created_at?: string;
  m_disabled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MDealerResponse {
  data: Array<MDealer>;
  links: Link;
  meta: Meta;
}
