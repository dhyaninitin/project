export interface ErrorObj {
  type: string;
  message: string;
}

export interface CalendarDateRange {
  begin: string | Date;
  end: string | Date;
}

export interface State {
  value: string;
  label: string;
}

export interface Year {
  id: number;
  name: string;
}

export interface Filter {
  search?: string;
  order_by?: string;
  order_dir?: string;
  page: number;
  per_page: number;
  type?:number;
  group_by?:number;
}

export interface TablePagination {
  length: number;
  pageIndex: number;
  pageSize: number;
  previousPageIndex: number;
}

export interface Link {
  first: string;
  last: string;
  prev: string;
  next: string;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
}
