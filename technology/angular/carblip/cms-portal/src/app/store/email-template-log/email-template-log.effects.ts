import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { EMAILTEMPLATELOGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './email-template-log.actions';
import { WorkflowService } from '../../shared/services/apis/workflow.service';

@Injectable()
export class EmailTemplateLogEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getEmailTemplateLogs(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: EMAILTEMPLATELOGS.TYPE,
              message: formatErrorMessage(err, EMAILTEMPLATELOGS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: EMAILTEMPLATELOGS.LIST_ERROR,
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