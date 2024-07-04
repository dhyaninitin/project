import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { DEAL } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { Request, RequestResponse } from 'app/shared/models/request.model';
import { AddError } from 'app/store/error/error.actions';
import * as logActions from 'app/store/requestlogs/requestlogs.actions';
import { initialState as initialLogState } from 'app/store/requestlogs/requestlogs.states';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import { RequestService } from '../../shared/services/apis/requests.service';
import * as actions from './requests.actions';

@Injectable()
export class RequestEffects {
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
              type: DEAL.TYPE,
              message: formatErrorMessage(err, DEAL.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEAL.LIST_ERROR,
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
          this.snack$.open('Contact Edited!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEAL.TYPE,
              message: formatErrorMessage(err, DEAL.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEAL.EDIT_ERROR,
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
          this.snack$.open('Deal successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          this.store$.dispatch(new logActions.GetList(initialLogState.filter));
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEAL.TYPE,
              message: DEAL.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: DEAL.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  getYears$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetYears)),
    switchMap(payload => {
      return from(this.service$.getYears()).pipe(
        map(result => {
          return new actions.GetListYears(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEAL.TYPE,
              message: formatErrorMessage(err, DEAL.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEAL.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: RequestService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
