import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import { FIND_STEP_BRAND, FIND_STEP_SEARCH } from 'app/core/constant';
import { IStore } from 'app/shared/interfaces/store.interface';
import * as BrandActions from 'app/shared/states/brands/brands.actions';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import * as ModelActions from 'app/shared/states/models/models.actions';
import { IRequestFecthList as IModelRequestFecthList } from 'app/shared/states/models/models.interfaces';
import { ISearchItem } from 'app/shared/states/search/search.interfaces';
import {
  getKeyword,
  getSearchItemsAsArray,
} from 'app/shared/states/search/search.selectors';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import { IRequestFecthList as ITrimRequestFecthList } from 'app/shared/states/trim/trim.interfaces';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  private pageTitle = 'Search Vehicles';
  public firstFindStep = FIND_STEP_BRAND;
  public currentFindStep = FIND_STEP_SEARCH;

  private onDestroy$ = new Subject<void>();
  public searchKeyword$: Observable<string>;
  public searchItems$: Observable<ISearchItem[]>;

  public searchKeyword: string;
  public vehicles: Array<ISearchItem>;

  constructor(private store$: Store<IStore>, private router$: Router) {
    this.searchKeyword$ = this.store$.select(getKeyword);
    this.searchItems$ = this.store$.select(getSearchItemsAsArray);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.initSubHeader();

    this.searchItems$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(vehicles => {
          this.vehicles = vehicles.sort((a: ISearchItem, b: ISearchItem) => {
            if (a.year === b.year) {
              return 0;
            }
            return a.year < b.year ? 1 : -1;
          });
        })
      )
      .subscribe();
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowSearchBox(true));
    this.store$.dispatch(new UiActions.SetSearchOpened(true));
    this.store$.dispatch(new UiActions.SetShowCancelSearch(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
  }

  getVehicleName(item: ISearchItem) {
    return item.Brand.name + ' ' + item.Model.name;
  }

  onSelectVehicle(item: ISearchItem) {
    this.store$.dispatch(new BrandActions.SelectBrand(item.brand_id));

    const modelPayload: IModelRequestFecthList = {
      brand_id: item.brand_id,
    };
    this.store$.dispatch(new ModelActions.ClearModelList());
    this.store$.dispatch(new ModelActions.FetchModelList(modelPayload));
    this.store$.dispatch(new ModelActions.SelectModel(item.model_id));

    const trimPayload: ITrimRequestFecthList = {
      models: [item.model_id],
    };
    this.store$.dispatch(new TrimActions.ClearTrimList());
    this.store$.dispatch(new TrimActions.FetchTrimList(trimPayload));
    this.store$.dispatch(new TrimActions.SelectTrim(item.id));

    this.store$.dispatch(new ConfigurationActions.ClearDetail());

    this.router$.navigate(['find-my-car/colors']);
  }
}
