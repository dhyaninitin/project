import { Injectable } from '@angular/core';
import { Effect,Actions,ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import * as actions from './workflowslogs.actions';
import { Action, Store } from '@ngrx/store';
import { AddError } from 'app/store/error/error.actions';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { WORKFLOWLOGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppState } from '..';

@Injectable()
export class WorkflowsLogsEffects {
    @Effect()
    getList$: Observable<Action> = this.actions$.pipe(
        ofType(actions.GET_LIST),
        map(action => (action as actions.GetList).payload),
        switchMap(payload => {
          return from(this.service$.getWorkflowLogs(payload)).pipe(
            map(result => {
              return new actions.GetListSuccess(result);
            }),
            catchError(err => {
              this.store$.dispatch(
                new AddError({
                  type: WORKFLOWLOGS.TYPE,
                  message: formatErrorMessage(err, WORKFLOWLOGS.LIST_ERROR),
                })
              );
              return of(
                new actions.AddError({
                  error: WORKFLOWLOGS.LIST_ERROR,
                })
              );
            })
          );
        })
      );

      @Effect()
      getListById$: Observable<Action> = this.actions$.pipe(
        ofType(actions.GET_LIST_BYID),
        map(action => (action as actions.GetListById).payload),
        switchMap(payload => {
          return from(this.service$.getWorkflowLogsByid(payload.filter,payload.id)).pipe(
            map(result => {
              return new actions.GetListByIdSuccess(result);
            }),
            catchError(err => {
              this.store$.dispatch(
                new AddError({
                  type: WORKFLOWLOGS.TYPE,
                  message: formatErrorMessage(err, WORKFLOWLOGS.LIST_ERROR),
                })
              );
              return of(
                new actions.AddError({
                  error: WORKFLOWLOGS.LIST_ERROR,
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