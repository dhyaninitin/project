import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PURCHASEORDER } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as actions from './purchase-order.actions';
import { filterSelector } from './purchase-order.selectors';
import { PurchaseOrderService } from 'app/shared/services/apis/purchase-order.service';
import { AppState } from '..';

@Injectable()
export class PurchaseOrderEffects {
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
              type: PURCHASEORDER.TYPE,
              message: formatErrorMessage(err, PURCHASEORDER.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: PURCHASEORDER.LIST_ERROR,
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
          this.snack$.open('Purchase order Added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.CreateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: PURCHASEORDER.TYPE,
              message: formatErrorMessage(err, PURCHASEORDER.ADD_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: PURCHASEORDER.ADD_ERROR,
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
          this.snack$.open('Purchase order Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: PURCHASEORDER.TYPE,
              message: formatErrorMessage(err, PURCHASEORDER.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: PURCHASEORDER.EDIT_ERROR,
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
          this.snack$.open('Purchase order has been successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: PURCHASEORDER.TYPE,
              message: PURCHASEORDER.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: PURCHASEORDER.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: PurchaseOrderService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
