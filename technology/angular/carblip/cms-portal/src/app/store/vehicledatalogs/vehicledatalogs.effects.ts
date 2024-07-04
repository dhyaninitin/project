import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { VEHICLEDATLOGS } from 'app/core/errors';
import { formatErrorMessage } from 'app/shared/helpers/api.helper';
import { AddError } from 'app/store/error/error.actions';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AppState } from '..';
import * as actions from './vehicledatalogs.actions';
import { VehicleDataService } from 'app/shared/services/apis/vehicle-data.service';

@Injectable()
export class VehicleDataLogsEffects {
  @Effect()
  getList$: Observable<Action> = this.actions$.pipe(
    ofType(actions.GET_LIST),
    map(action => (action as actions.GetList).payload),
    switchMap(payload => {
      return from(this.service$.getVehicleDataLogs(payload)).pipe(
        map(result => {
          return new actions.GetListSuccess(result);
        }),
        catchError(err => {
          this.store$.dispatch(
            new AddError({
              type: VEHICLEDATLOGS.TYPE,
              message: formatErrorMessage(err, VEHICLEDATLOGS.LIST_ERROR),
            })
          );
          return of(
            new actions.AddError({
              error: VEHICLEDATLOGS.LIST_ERROR,
            })
          );
        })
      );
    })
  );

  constructor(
    private actions$: Actions,
    private service$: VehicleDataService,
    private store$: Store<AppState>
  ) {}
}