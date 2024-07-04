import { Injectable } from '@angular/core';
import { Effect,Actions,ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import * as actions from './enrollment-history.actions';
import { Action, Store } from '@ngrx/store';
import { AddError } from 'app/store/error/error.actions';
import { WorkflowService } from 'app/shared/services/apis/workflow.service';
import { ENROLLMENTHISTORY } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AppState } from '..';

@Injectable()
export class EnrollmentHistoryEffects {
    @Effect()
    getListById$: Observable<Action> = this.actions$.pipe(
      ofType(actions.GET_LIST),
      map(action => (action as actions.GetList).payload),
      switchMap(payload => {
        return from(this.service$.getEnrollmentHistoryById(payload.filter,payload.id, payload.newFilter)).pipe(
          map(result => {
            return new actions.GetListSuccess(result);
          }),
          catchError(err => {
            this.store$.dispatch(
              new AddError({
                type: ENROLLMENTHISTORY.TYPE,
                message: formatErrorMessage(err, ENROLLMENTHISTORY.LIST_ERROR),
              })
            );
            return of(
              new actions.AddError({
                error: ENROLLMENTHISTORY.LIST_ERROR,
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