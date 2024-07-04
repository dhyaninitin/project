import { Link, Meta, Pagination } from './common.model';

export interface Make {
  id: number;
  name: string;
  captive?: string;
  is_domestic?: number;
  is_new?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MakeResponse {
  data: Array<Make>;
  links: Link;
  meta: Meta;
}
