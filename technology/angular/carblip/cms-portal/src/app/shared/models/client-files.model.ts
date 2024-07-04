import { Link, Meta, Pagination } from './common.model';

/**
 * ClientFiles Interface
 */
export interface ClientFiles {
  id:  number,
  first_name?: string,
  last_name?: string,
  phone?: string,
  email_address?: string,
  created_at?: string,
  updated_at?: string
}

/**
 * ClientFiles Response Interface
 */
export interface ClientFilesResponse {
  data: Array<ClientFiles>;
  links: Link;
  meta: Meta;
}
