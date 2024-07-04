import { Link, Meta, Pagination } from './common.model';

export interface Model {
  id: number;
  name: string;
  m_make_id?: number;
  is_new?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ModelResponse {
  data: Array<Model>;
  links: Link;
  meta: Meta;
}
