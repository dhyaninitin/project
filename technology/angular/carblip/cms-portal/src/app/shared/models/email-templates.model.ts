import { Link, Meta, Pagination } from './common.model';

export interface EmailTemplate {
    id: number;
    title: string;
    subject: string;
    body: string;
    added_by: string;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface WorkflowEmailTemplateResponse {
    data: Array<EmailTemplate>;
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