import { NavigationExtras } from '@angular/router';
import { Action } from '@ngrx/store';

export const GO = '[Router] Go';
export const BACK = '[Router] Back';
export const FORWARD = '[Router] Forward';
export const NO_OP = '[Router] No Operation';

export class Go implements Action {
  readonly type = GO;

  /**
   * Constructor
   *
   * @param {{path: any[]; query?: object; extras?: NavigationExtras}} payload
   */
  constructor(
    public payload: {
      path: any[];
      query?: object;
      extras?: NavigationExtras;
    }
  ) {}
}

export class Back implements Action {
  readonly type = BACK;
}

export class Forward implements Action {
  readonly type = FORWARD;
}

export class NoOp implements Action {
  readonly type = NO_OP;
}

export type Actions = Go | Back | Forward | NoOp;
