import { Link, Meta, Pagination } from './common.model';

export interface SmsTemplate {
    id: number;
    title: string;
    message: Array<string>;
    added_by: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface WorkflowSmsTemplateResponse {
    data: Array<SmsTemplate>;
    links: Link;
    meta: Meta;
}

export interface Filter {
    search?: string;
    order_by?: string;
    order_dir?: string;
    page: number;
    per_page: number;
}