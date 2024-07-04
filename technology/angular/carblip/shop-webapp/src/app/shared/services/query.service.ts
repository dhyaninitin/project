import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Injectable } from '@angular/core';

import * as BrandActions from 'app/shared/states/brands/brands.actions';
import * as ModelActions from 'app/shared/states/models/models.actions';
import * as RequestsAcions from 'app/shared/states/my-request/myrequests.actions';
import * as TrimActions from 'app/shared/states/trim/trim.actions';

@Injectable()
export class QueryService {
  constructor(private store$: Store<IStore>) {}

  private onDestroy$ = new Subject<void>();
  public brandDidFetch$: Observable<boolean>;

  /* Function to preload data for brand page
   * @param brand_id number - id for selected brand
   * @return
   */

  brandsQuery(brand_id: number) {
    this.brandDidFetch$ = this.store$.pipe(
      select(state => state.brand.didFetch)
    );
    this.brandDidFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (!didFetch) {
            this.store$.dispatch(new BrandActions.FetchBrandList());
          } else {
            this.store$.dispatch(new BrandActions.SelectBrand(brand_id));
          }
        })
      )
      .subscribe();
  }

  /* Function to preload data for model page
   * @param brand_id number - id for selected brand
   * @param model_id number - id for selected model
   * @param year number - selected year value
   * @return
   */

  modelsQuery(brand_id: number, model_id: number, year: number) {
    this.brandsQuery(brand_id);
    this.store$.dispatch(new ModelActions.ClearModelList());
    const request = {
      brand_id: brand_id,
      year: year,
    };
    this.store$.dispatch(new ModelActions.FetchModelList(request));
    this.store$.dispatch(new ModelActions.SelectModel(model_id));
    this.store$.dispatch(new ModelActions.UpdateYear(year));
  }

  /* Function to preload data for model page
   * @param brand_id number - id for selected brand
   * @param model_id number - id for selected model
   * @param year number - selected year value
   * @param trim_id number - id for selected vehicle
   * @return
   */

  trimsQuery(
    brand_id: number,
    model_id: number,
    year: number,
    trim_id: number
  ) {
    this.modelsQuery(brand_id, model_id, year);
    this.store$.dispatch(new TrimActions.ClearTrimList());
    const request = {
      models: [model_id],
    };
    this.store$.dispatch(new TrimActions.FetchTrimList(request));
    this.store$.dispatch(new TrimActions.SelectTrim(trim_id));
    this.store$.dispatch(new ModelActions.UpdateYear(year));
  }

  /* Function to preload request data
   * @param request_id number - id for selected request id
   * @return
   */
  requestQuery(request_id: number) {
    const payload = {
      page: 1,
      count: 9,
    };
    this.store$.dispatch(new RequestsAcions.FetchRequestList(payload));
    this.store$.dispatch(new RequestsAcions.SelectMyRequest(request_id));
  }
}
