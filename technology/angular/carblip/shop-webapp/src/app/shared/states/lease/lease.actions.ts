import { Action } from '@ngrx/store';

import { ILease } from './lease.interfaces';

export const FETCH_LEASE_INFO = '[LEASE] Fetch lease info';
export class FetchLeaseInfo implements Action {
  readonly type = FETCH_LEASE_INFO;

  constructor(public payload: { user_id: number }) {}
}

export const FETCH_LEASE_INFO_SUCCESS = '[LEASE] Fetch lease info success';
export class FetchLeaseInfoSuccess implements Action {
  readonly type = FETCH_LEASE_INFO_SUCCESS;

  constructor(public payload: ILease) {}
}

export const FFETCH_LEASE_INFO_FAILED = '[LEASE] Fetch lease info failed';
export class FetchLeaseInfoFailed implements Action {
  readonly type = FFETCH_LEASE_INFO_FAILED;

  constructor(public payload: { error: string }) {}
}

export const CLEAR_LEASE_INFO = '[LEASE]Clear lease info';
export class ClearLeaseInfo implements Action {
  readonly type = CLEAR_LEASE_INFO;

  constructor() {}
}
export type All =
  | FetchLeaseInfo
  | FetchLeaseInfoSuccess
  | FetchLeaseInfoFailed
  | ClearLeaseInfo;
