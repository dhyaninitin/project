import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { DEALSTAGE } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { DealStage, DealStageResponse } from 'app/shared/models/deal.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import { DealStageService } from '../../shared/services/apis/dealstage.service';
import * as actions from './dealstage.actions';

@Injectable()
export class DealstageEffects {
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
              type: DEALSTAGE.TYPE,
              message: formatErrorMessage(err, DEALSTAGE.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALSTAGE.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  getPortalDealStageList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_PORTAL_DEAL_STAGE_LIST),
    map(action => (action as actions.GetPortalDealStageList).payload),
    switchMap(payload => {
      return from(this.service$.getDealStageList(payload)).pipe(
        map(result => {
          return new actions.GetPortalDealStageListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALSTAGE.TYPE,
              message: formatErrorMessage(err, DEALSTAGE.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALSTAGE.LIST_ERROR,
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
          this.snack$.open('Deal Stage has been successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALSTAGE.TYPE,
              message: DEALSTAGE.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: DEALSTAGE.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  update$: Observable<Action> = this.actions$.pipe(
    ofType(actions.UPDATE),
    map(action => (action as actions.Update).payload),
    switchMap(payload => {
      return from(this.service$.update(payload.id, payload.data)).pipe(
        map(result => {
          // this.snack$.open('User Updated!', 'OK', {
          //   duration: 4000,
          //   verticalPosition: 'top',
          //   panelClass: ['snack-success'],
          // });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALSTAGE.TYPE,
              message: formatErrorMessage(err, DEALSTAGE.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALSTAGE.EDIT_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: DealStageService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
