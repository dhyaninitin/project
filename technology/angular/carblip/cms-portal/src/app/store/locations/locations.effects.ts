import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { LOCATION } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { Location, LocationResponse } from 'app/shared/models/location.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import { LocationService } from '../../shared/services/apis/locations.service';
import * as actions from './locations.actions';

@Injectable()
export class LocationEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getList(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: LOCATION.TYPE,
              message: formatErrorMessage(err, LOCATION.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: LOCATION.LIST_ERROR,
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
          this.snack$.open('Location successfully added!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.CreateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: LOCATION.TYPE,
              message: formatErrorMessage(err, LOCATION.ADD_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: LOCATION.ADD_ERROR,
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
          this.snack$.open('Location successfully edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: LOCATION.TYPE,
              message: formatErrorMessage(err, LOCATION.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: LOCATION.EDIT_ERROR,
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
          this.snack$.open('Location successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: LOCATION.TYPE,
              message: LOCATION.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: LOCATION.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: LocationService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
