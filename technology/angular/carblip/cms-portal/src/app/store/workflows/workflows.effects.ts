import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WORKFLOW } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { Workflow, WorkflowResponse } from 'app/shared/models/workflow.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './workflows.actions';
import { WorkflowService } from '../../shared/services/apis/workflow.service';

@Injectable()
export class WorkflowEffects {
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
              type: WORKFLOW.TYPE,
              message: formatErrorMessage(err, WORKFLOW.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: WORKFLOW.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  @Effect()
  toggle$: Observable<Action> = this.actions$.pipe(
    ofType(actions.TOGGLE),
    map(action => (action as actions.Update).payload),
    switchMap(payload => {
      return from(this.service$.toggle(payload.data)).pipe(
        map(result => {
          let message = 'Workflow Activated Successfully!';
          if(result?.data?.is_active == 1) {
            message = 'Workflow Deactivated Successfully!';
          }
          this.snack$.open(message, 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.UpdateSuccess(result.data);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WORKFLOW.TYPE,
              message: formatErrorMessage(err, WORKFLOW.EDIT_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: WORKFLOW.EDIT_ERROR,
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
          this.snack$.open('Workflow Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WORKFLOW.TYPE,
              message: WORKFLOW.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: WORKFLOW.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: WorkflowService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}