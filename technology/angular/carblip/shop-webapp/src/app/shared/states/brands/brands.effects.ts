import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as BrandsActions from 'app/shared/states/brands/brands.actions';
import { BrandsServiceImpl } from 'app/shared/states/brands/brands.service';
import { environment } from 'environments/environment';

@Injectable()
export class BrandsEffects {
  constructor(
    // if needed, you can inject the store to get some part of
    // it with a `withLatestFrom` for example
    // private store$: Store<IStore>,
    private actions$: Actions,
    private brandsService: BrandsServiceImpl
  ) {}

  // tslint:disable-next-line:member-ordering
  @Effect({ dispatch: true })
  fetchBrandList$: Observable<Action> = this.actions$.pipe(
    ofType<BrandsActions.FetchBrandList>(BrandsActions.FETCH_BRAND_LIST),
    switchMap(action =>
      this.brandsService.fetchBrandList().pipe(
        map(
          brands => new BrandsActions.FetchBrandListSuccess({ data: brands })
        ),
        catchError(err => {
          if (environment.debug) {
            console.group();
            console.warn('Error caught in brands.effects:');
            console.error(err);
            console.groupEnd();
          }

          return of(
            new BrandsActions.FetchBrandListFailed({
              error: err,
            })
          );
        })
      )
    )
  );
}
