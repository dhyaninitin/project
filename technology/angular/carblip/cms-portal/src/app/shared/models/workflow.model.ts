import { Link, Meta, Pagination } from './common.model';

export interface Filter {
    search?: string;
    order_by?: string;
    order_dir?: string;
    page: number;
    per_page: number;
}

interface WorkflowDetail {
    actions: Array<any>;
    triggers: Array<any>;
}
/**
 * Workflow Interface
 */
export interface Workflow {
    id: number;
    title: string;
    type: string;
    is_active: number;
    activation: number;
    workflow_payload: WorkflowDetail;
    added_by:string;
    execute_time:number;
    schedule_time:Array<any>;
    created_at: string;
    updated_at: string;
}
/**
 * Workflow List Response Interface
 */
export interface WorkflowResponse {
    data: Array<Workflow>;
    links: Link;
    meta: Meta;
}
  