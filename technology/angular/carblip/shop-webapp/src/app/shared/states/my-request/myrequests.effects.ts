import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, switchMap } from 'rxjs/operators';

import { IStore } from 'app/shared/interfaces/store.interface';
import * as RequestsActions from 'app/shared/states/my-request/myrequests.actions';
import { IRequest } from 'app/shared/states/my-request/myrequests.interfaces';
import { MyRequestServiceImpl } from 'app/shared/states/my-request/myrequests.service';
import { ConfigurationServiceImpl } from '../configuration/configuration.service';

@Injectable()
export class MyRequestEffects {
  constructor(
    private actions$: Actions,
    private requestsService: MyRequestServiceImpl,
    private configurationService: ConfigurationServiceImpl,
    private store$: Store<IStore>
  ) {}

  @Effect({ dispatch: true })
  fetchRequestList$: Observable<Action> = this.actions$.pipe(
    ofType<RequestsActions.FetchRequestList>(
      RequestsActions.FETCH_REQUEST_LIST
    ),
    switchMap(action =>
      this.requestsService.fetchRequestList(action.payload).pipe(
        map((requests: Array<IRequest>) => {
          requests.forEach(item => {
            if (item.request_type === 1) {
              const requestParam = {
                configuration_state_id: item.configuration_state_id,
              };
              this.configurationService
                .getColorOptionById(requestParam)
                .pipe(
                  map(colorResult => {
                    const payload = {
                      id: item.id,
                      data: colorResult,
                    };
                    this.store$.dispatch(
                      new RequestsActions.FetchRequestColorSuccess(payload)
                    );
                  }),
                  catchError(colorErr => {
                    return of(
                      new RequestsActions.FetchRequestColorFailed({
                        error: colorErr,
                      })
                    );
                  })
                )
                .subscribe();
            }
          });

          return new RequestsActions.FetchRequestListSuccess({
            data: requests,
          });
        }),
        catchError(err => {
          return of(new RequestsActions.FetchRequestListFailed({ error: err }));
        })
      )
    )
  );
}
