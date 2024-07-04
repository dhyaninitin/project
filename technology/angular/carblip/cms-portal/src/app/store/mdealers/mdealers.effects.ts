import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MDEALER } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { MDealer, MDealerResponse } from 'app/shared/models/mdealer.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { AppState } from '..';
import { MDealerService } from '../../shared/services/apis/mdealer.service';
import * as actions from './mdealers.actions';
import { filterSelector } from './mdealers.selectors';

@Injectable()
export class MDealerEffects {
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
              type: MDEALER.TYPE,
              message: formatErrorMessage(err, MDEALER.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: MDEALER.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: MDealerService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
