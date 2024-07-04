import { Link, Meta, Pagination } from './common.model';

export interface UpdateLocation {
  name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  map(arg0: (location: any) => any): string;
  id?: number;
  name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocationResponse {
  data: Array<Location>;
  links: Link;
  meta: Meta;
}
