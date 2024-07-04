import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { FIND_STEP_BRAND, FIND_STEP_MODEL } from 'app/core/constant';
import { CLICK_ON_BRAND, VIEW_BRAND_PAGE } from 'app/core/events';

import { IStore } from 'app/shared/interfaces/store.interface';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as BrandActions from 'app/shared/states/brands/brands.actions';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import {
  getBrandsAsArray,
  selectCurrentBrandId,
} from 'app/shared/states/brands/brands.selectors';
import * as ModelActions from 'app/shared/states/models/models.actions';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import * as UiActions from 'app/shared/states/ui/ui.actions';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit, OnDestroy {
  public abc = 'not used only for checking '
  public pageTitle = 'Shop By Brand';
  public nextFindStep = FIND_STEP_MODEL;
  public currentFindStep = FIND_STEP_BRAND;
  private onDestroy$ = new Subject<void>();
  public brands$: Observable<IBrand[]>;
  public selectedBrandId$: Observable<number>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public searchString$: Observable<string>;

  public selectedBrandId: number;
  public searchString = null;
  public brands: IBrand[] = [];
  public filteredBrands: IBrand[] = [];
  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private segmentioService$: SegmentioService
  ) { }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_BRAND_PAGE.EVENT_NAME,
      VIEW_BRAND_PAGE.PROPERTY_NAME,
      VIEW_BRAND_PAGE.SCREEN_NAME,
      VIEW_BRAND_PAGE.ACTION_NAME
    );

    this.fetching$ = this.store$.select(state => state.brand.fetching);
    this.didFetch$ = this.store$.select(state => state.brand.didFetch);
    this.brands$ = this.store$.select(getBrandsAsArray);
    this.selectedBrandId$ = this.store$.select(selectCurrentBrandId);
    this.searchString$ = this.store$.select(state => state.ui.searchString);

    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowStepper(true));
    this.store$.dispatch(new UiActions.SetShowSearchBox(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetShowBackIcon(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));

    // this.store$.dispatch(new BrandActions.FetchBrandList())

    this.selectedBrandId$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brandId => (this.selectedBrandId = brandId))
      )
      .subscribe();

    this.didFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(
          didFetch =>
            !didFetch && this.store$.dispatch(new BrandActions.FetchBrandList())
        )
      )
      .subscribe();

    this.brands$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brands => {
          brands.sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          });
          this.brands = this.filteredBrands = brands;
        })
      )
      .subscribe();

    this.searchString$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(searchString => {
          if (searchString) {
            this.filteredBrands = this.brands.filter(
              brand =>
                brand.name.toLowerCase().indexOf(searchString.toLowerCase()) >=
                0
            );
          } else {
            this.filteredBrands = this.brands;
          }
        })
      )
      .subscribe();
  }

  getBrandNameFromId(id: number): string {
    const selectedBrand = this.brands.find(item => item.id === id);
    if (selectedBrand) {
      return selectedBrand.name;
    }
    return '';
  }

  onSelectBrand(id: number) {
    const property_name = CLICK_ON_BRAND.PROPERTY_NAME.replace(
      'brand',
      this.getBrandNameFromId(id)
    );
    this.segmentioService$.track(
      CLICK_ON_BRAND.EVENT_NAME,
      property_name,
      CLICK_ON_BRAND.SCREEN_NAME,
      CLICK_ON_BRAND.ACTION_NAME
    );

    if (this.selectedBrandId !== id) {
      this.store$.dispatch(new ModelActions.ClearModelList());
      this.store$.dispatch(new TrimActions.ClearTrimList());
      this.store$.dispatch(new BrandActions.SelectBrand(id));
    }
    this.goToNextStep(id);
  }

  goToNextStep(id: number) {
    this.store$.dispatch(new UiActions.SetLastStep(this.currentFindStep));
    this.router$.navigate(['find-my-car/' + this.nextFindStep], {
      queryParams: { brand: id },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
