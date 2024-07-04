import { Link, Meta } from './common.model';

export interface PortalDealStage {
    label: string,
    pipeline: string
}

export interface PortalDealStagePayload {
    id: number,
    stage_id: string,
    label: string,
    order: number,
    pipeline: string,
    active: number,
    created_at: string,
    updated_at: string
}

export interface PortalDealStageResponse {
    data: Array<PortalDealStagePayload>;
    links: Link;
    meta: Meta;
  }
