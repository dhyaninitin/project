import { Link, Meta, Pagination } from './common.model';

export interface PhoneNumber {
    id: number;
    portal_user_id: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export interface PhoneNumbersList {
    id: number;
    phone: string;
    first_name: string;
    last_name: string;
    email: string;
    is_deleted: number;
    created_at: string;
    updated_at: string;
}

export interface PhoneNumbersResponse {
    data: Array<PhoneNumbersList>;
    links: Link;
    meta: Meta;
}