import { Link, Meta, Pagination } from './common.model';

export interface CarsDirectFilter {
    start_date?: string;
    end_date?: string;
    location?: string;
    contact_owner?: number;
}

export interface Filter {
    search?: string;
    filter?: CarsDirectFilter;
    order_by?: string;
    order_dir?: string;
    page: number;
    per_page: number;
}

export interface BlockList {
    id: number;
    phone: string;
    count: number;
    created_at: string;
    updated_at: string;
}

export interface BlockResponse {
    data: Array<BlockList>;
    links: Link;
    meta: Meta;
}