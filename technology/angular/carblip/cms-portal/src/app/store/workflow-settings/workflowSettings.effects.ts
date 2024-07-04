import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { WORKFLOWSETTINGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './workflowSettings.actions';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';

@Injectable()
export class WorkflowSettingsEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getwWorkflowSettingsLogs(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: WORKFLOWSETTINGS.TYPE,
              message: formatErrorMessage(err, WORKFLOWSETTINGS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: WORKFLOWSETTINGS.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: WorkflowService,
    private store$: Store<AppState>
  ) {}
}
