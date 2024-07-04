import { Link, Meta, Pagination } from './common.model';

export interface Filter {
  search?: string;
  page: number;
  per_page: number;
  type?: number;
}

export interface Log {
  id: number;
  category: string;
  content: string;
  is_read: number;
  is_view: number;
  created_at: string;
  updated_at: string;
}

export interface LogResponse {
  data: Array<Log>;
  links: Link;
  meta: Meta;
}

export interface ScraperFilter {
  search?: string;
  page: number;
  per_page: number;
  type: number;
}
