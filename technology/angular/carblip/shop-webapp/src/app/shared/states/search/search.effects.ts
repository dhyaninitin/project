import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as SearchActions from 'app/shared/states/search/search.actions';
import { SearchServiceImpl } from 'app/shared/states/search/search.service';

@Injectable()
export class SearchEffects {
  constructor(
    // if needed, you can inject the store to get some part of
    // it with a `withLatestFrom` for example
    // private store$: Store<IStore>,
    private actions$: Actions,
    private searchService: SearchServiceImpl
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchSearchList$: Observable<Action> = this.actions$.pipe(
    ofType<SearchActions.FetchSearchList>(SearchActions.FETCH_SEARCH_LIST),
    switchMap(action =>
      this.searchService.fetchSearchList(action.requestParam).pipe(
        map(result => new SearchActions.FetchSearchListSuccess(result)),
        catchError(err => {
          return of(
            new SearchActions.FetchSearchListFailed({
              error: err,
            })
          );
        })
      )
    )
  );
}
