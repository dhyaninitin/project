import { Link, Meta, Pagination } from './common.model';

export interface Dealer {
  id?: number;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  website?: string;
  rhs?:number;
  created_at?: string;
  updated_at?: string;
}

export interface DealerContact {
  id?: number;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  rhs?:number;
  created_at?: string;
  updated_at?: string;
}

export interface NewDealerContact extends DealerContact {
  dealer_id: string;
}

export interface DealerResponse {
  data: Array<Dealer>;
  links: Link;
  meta: Meta;
}

export interface DealerContactResponse {
  data: Array<DealerContact>;
  links: Link;
  meta: Meta;
}
