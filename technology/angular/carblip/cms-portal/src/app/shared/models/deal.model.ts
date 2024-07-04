import { Link, Meta, Pagination } from './common.model';

export interface DealStage {
  id: number;
  name: string;
  label: string;
  captive?: string;
  is_domestic?: number;
  is_new?: number;
  pipeline?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DealStageResponse {
  data: Array<DealStage>;
  links: Link;
  meta: Meta;
}
