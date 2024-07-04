import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import { ConfigurationServiceImpl } from 'app/shared/states/configuration/configuration.service';

@Injectable()
export class ConfigurationEffects {
  constructor(
    // if needed, you can inject the store to get some part of
    // it with a `withLatestFrom` for example
    // private store$: Store<IStore>,
    private actions$: Actions,
    private configurationService: ConfigurationServiceImpl
  ) {}

  @Effect({ dispatch: true })
  fetchDefaultConfiguration$: Observable<Action> = this.actions$.pipe(
    ofType<ConfigurationActions.FetchDefaultConfigurationList>(
      ConfigurationActions.FETCH_DEFALUT_CONFIGURATION
    ),
    switchMap(action =>
      this.configurationService.fetchDefaultConfiguration(action.payload).pipe(
        map(
          data =>
            new ConfigurationActions.FetchDefaultConfigurationListSuccess({
              data: data,
            })
        ),
        catchError(err => {
          return of(
            new ConfigurationActions.FetchDefaultConfigurationListFailed({
              error: err,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  fetchConfigurationById$: Observable<Action> = this.actions$.pipe(
    ofType<ConfigurationActions.FetchConfigurationById>(
      ConfigurationActions.FETCH_CONFIGURATION_BY_ID
    ),
    switchMap(action =>
      this.configurationService.fetchConfigurationById(action.payload).pipe(
        map(
          data =>
            new ConfigurationActions.FetchConfigurationByIdSuccess({
              data: data,
            })
        ),
        catchError(err => {
          return of(
            new ConfigurationActions.FetchConfigurationByIdFailed({
              error: err,
            })
          );
        })
      )
    )
  );

  @Effect({ dispatch: true })
  toggleOption$: Observable<Action> = this.actions$.pipe(
    ofType<ConfigurationActions.ToggleOption>(
      ConfigurationActions.TOGGLE_OPTION
    ),
    switchMap(action =>
      this.configurationService.toggleOption(action.payload).pipe(
        map(
          data => new ConfigurationActions.ToggleOptionSuccess({ data: data })
        ),
        catchError(err => {
          return of(
            new ConfigurationActions.ToggleOptionFailed({
              error: err,
            })
          );
        })
      )
    )
  );
}
