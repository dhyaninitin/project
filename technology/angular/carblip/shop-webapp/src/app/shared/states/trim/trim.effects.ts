import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as TrimActions from 'app/shared/states/trim/trim.actions';
import { TrimServiceImpl } from 'app/shared/states/trim/trim.service';
import { environment } from 'environments/environment';

@Injectable()
export class TrimEffects {
  constructor(
    // if needed, you can inject the store to get some part of
    // it with a `withLatestFrom` for example
    // private store$: Store<IStore>,
    private actions$: Actions,
    private trimService: TrimServiceImpl
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchTrimList$: Observable<Action> = this.actions$.pipe(
    ofType<TrimActions.FetchTrimList>(TrimActions.FETCH_TRIM_LIST),
    switchMap(action =>
      this.trimService.fetchTrimList(action.requestParam).pipe(
        map(trim => new TrimActions.FetchTrimListSuccess({ data: trim })),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in trim.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new TrimActions.FetchTrimListFailed({
              error: err,
            })
          );
        })
      )
    )
  );
}
