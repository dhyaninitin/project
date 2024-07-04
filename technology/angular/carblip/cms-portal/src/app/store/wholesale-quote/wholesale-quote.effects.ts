import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { WHOLESALEQUOTE } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { WholesaleQuote, WholesaleQuoteResponse } from 'app/shared/models/wholesale-quote.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { WholesaleQuoteService } from '../../shared/services/apis/wholesale-quote.service';
import * as actions from './wholesale-quote.actions';
import { filterSelector } from './wholesale-quote.selectors';

@Injectable()
export class WholesaleQuoteEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    withLatestFrom(this.store$.select(filterSelector)),
    switchMap(([action, filter]) => {
      return from(this.service$.getList(filter)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WHOLESALEQUOTE.TYPE,
              message: formatErrorMessage(err, WHOLESALEQUOTE.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: WHOLESALEQUOTE.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  delete$: Observable<Action> = this.actions$.pipe(
    ofType(actions.DELETE),
    map(action => (action as actions.Delete).payload),
    switchMap(payload => {
      return from(this.service$.delete(payload.id)).pipe(
        map(result => {
          this.snack$.open('Wholesale Quote has been successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WHOLESALEQUOTE.TYPE,
              message: WHOLESALEQUOTE.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: WHOLESALEQUOTE.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: WholesaleQuoteService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
