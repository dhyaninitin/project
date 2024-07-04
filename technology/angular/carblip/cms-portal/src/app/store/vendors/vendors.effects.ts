import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { VENDORS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { Vendors } from 'app/shared/models/vendors.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './vendors.actions';
import { filterSelector } from './vendors.selectors';
import { VendorsService } from 'app/shared/services/apis/vendors.service';

@Injectable()
export class VendorsEffects {
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
              type: VENDORS.TYPE,
              message: formatErrorMessage(err, VENDORS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VENDORS.LIST_ERROR,
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
          this.snack$.open('Vendor Added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.CreateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VENDORS.TYPE,
              message: formatErrorMessage(err, VENDORS.ADD_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VENDORS.ADD_ERROR,
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
          this.snack$.open('Vendor Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VENDORS.TYPE,
              message: formatErrorMessage(err, VENDORS.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VENDORS.EDIT_ERROR,
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
          this.snack$.open('Vendor has been successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VENDORS.TYPE,
              message: VENDORS.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: VENDORS.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: VendorsService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
