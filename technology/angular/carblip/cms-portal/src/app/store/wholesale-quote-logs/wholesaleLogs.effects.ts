import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { WHOLESALEQUOTESLOGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './wholesaleLogs.actions';
import { TasksService } from 'app/shared/services/apis/tasks.service';
import { WholesaleQuoteService } from 'app/shared/services/apis/wholesale-quote.service';

@Injectable()
export class WholesaleLogsEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getWholesaleQuotesLogs(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WHOLESALEQUOTESLOGS.TYPE,
              message: formatErrorMessage(err, WHOLESALEQUOTESLOGS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: WHOLESALEQUOTESLOGS.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: WholesaleQuoteService,
    private store$: Store<AppState>
  ) {}
}
