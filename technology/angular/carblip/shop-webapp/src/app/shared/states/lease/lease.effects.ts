import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as LeaseActions from './lease.actions';
import { LeaseServiceImpl } from './lease.service';

@Injectable()
export class LeaseEffects {
  constructor(
    private actions$: Actions,
    private leasetService: LeaseServiceImpl
  ) {}

  @Effect({ dispatch: true })
  leaseInfo$: Observable<Action> = this.actions$.pipe(
    ofType<LeaseActions.FetchLeaseInfo>(LeaseActions.FETCH_LEASE_INFO),
    switchMap(action =>
      this.leasetService.fetchLeaseInfo(action.payload).pipe(
        map(response => new LeaseActions.FetchLeaseInfoSuccess(response)),
        catchError(err =>
          of(new LeaseActions.FetchLeaseInfoFailed({ error: err }))
        )
      )
    )
  );
}
