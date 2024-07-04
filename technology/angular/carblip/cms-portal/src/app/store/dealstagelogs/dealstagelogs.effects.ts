import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { DEALSTAGELOGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import { PortalUserService } from '../../shared/services/apis/portalusers.service';
import * as actions from './dealstagelogs.actions';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';

@Injectable()
export class DealStageLogsEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getLogs(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: DEALSTAGELOGS.TYPE,
              message: formatErrorMessage(err, DEALSTAGELOGS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: DEALSTAGELOGS.LIST_ERROR,
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
