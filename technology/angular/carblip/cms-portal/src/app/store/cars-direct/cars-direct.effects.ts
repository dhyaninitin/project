import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';

import { MatSnackBar } from '@angular/material/snack-bar';
import { CARSDIRECT } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import * as commonModels from 'app/shared/models/common.model';
import { CarsDirect, CarsDirectResponse } from 'app/shared/models/cars-direct.model';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap ,withLatestFrom} from 'rxjs/operators';
import { AppState } from '..';
import { CarsDirectService } from '../../shared/services/apis/cars-direct.service';
import * as actions from './cars-direct.actions';
import { filterSelector } from './cars-direct.selectors';

@Injectable()
export class CarsDirectEffects {
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
              type: CARSDIRECT.TYPE,
              message: formatErrorMessage(err, CARSDIRECT.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: CARSDIRECT.LIST_ERROR,
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
          this.snack$.open('Carsdirect successfully Deleted!', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          });
          // this.store$.dispatch(new logActions.GetList(initialLogState.filter));
          return new actions.DeleteSuccess();
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: CARSDIRECT.TYPE,
              message: CARSDIRECT.DELETE_ERROR,
            })
          );
          return of(
            new actions.AddError({
              error: CARSDIRECT.DELETE_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: CarsDirectService,
    private snack$: MatSnackBar,
    private store$: Store<AppState>
  ) {}
}
