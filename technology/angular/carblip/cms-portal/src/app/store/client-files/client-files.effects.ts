import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CLIENTFILES } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './client-files.actions';
import { ClientFilesService } from 'app/shared/services/apis/client-files.service';
import { filterSelector } from './client-files.selectors';

@Injectable()
export class ClientFilesEffects {
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
              type: CLIENTFILES.TYPE,
              message: formatErrorMessage(err, CLIENTFILES.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: CLIENTFILES.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: ClientFilesService,
    // private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
