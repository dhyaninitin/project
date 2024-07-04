import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { DEALER } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { Dealer, DealerResponse } from 'app/shared/models/dealer.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { DealerService } from '../../shared/services/apis/dealer.service';
import * as actions from './dealers.actions';
import { filterSelector } from './dealers.selectors';

@Injectable()
export class DealerEffects {
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
              type: DEALER.TYPE,
              message: formatErrorMessage(err, DEALER.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALER.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  create$: Observable<Action> = this.actions$.pipe(
    ofType(actions.CREATE),
    map(action => (action as actions.Create).payload),
    switchMap(payload => {
      return from(this.service$.create(payload)).pipe(
        map(result => {
          this.snack$.open('Dealer Added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.CreateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALER.TYPE,
              message: formatErrorMessage(err, DEALER.ADD_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALER.ADD_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  edit$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE),
    map(action => (action as actions.Update).payload),
    switchMap(payload => {
      return from(this.service$.update(payload.id, payload.data)).pipe(
        map(result => {
          this.snack$.open('Dealer Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALER.TYPE,
              message: formatErrorMessage(err, DEALER.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALER.EDIT_ERROR,
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
          this.snack$.open('Supplier Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALER.TYPE,
              message: DEALER.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: DEALER.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: DealerService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
