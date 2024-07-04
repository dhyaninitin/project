import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as ModelsActions from 'app/shared/states/models/models.actions';
import { ModelsServiceImpl } from 'app/shared/states/models/models.service';
import { environment } from 'environments/environment';

@Injectable()
export class ModelsEffects {
  constructor(
    // if needed, you can inject the store to get some part of
    // it with a `withLatestFrom` for example
    // private store$: Store<IStore>,
    private actions$: Actions,
    private modelsService: ModelsServiceImpl
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchModelList$: Observable<Action> = this.actions$.pipe(
    ofType<ModelsActions.FetchModelList>(ModelsActions.FETCH_MODEL_LIST),
    switchMap(action =>
      this.modelsService.fetchModelList(action.requestParam).pipe(
        map(
          models => new ModelsActions.FetchModelListSuccess({ data: models })
        ),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in models.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new ModelsActions.FetchModelListFailed({
              error: err,
            })
          );
        })
      )
    )
  );
}
