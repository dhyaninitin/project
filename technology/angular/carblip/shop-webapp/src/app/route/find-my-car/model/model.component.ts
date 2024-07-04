import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import {
  FIND_STEP_BRAND,
  FIND_STEP_MODEL,
  FIND_STEP_TRIM,
} from 'app/core/constant';
import { CLICK_ON_MODEL, VIEW_MODEL_PAGE } from 'app/core/events';

import { IStore } from 'app/shared/interfaces/store.interface';
import { QueryService } from 'app/shared/services/query.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import * as ModelActions from 'app/shared/states/models/models.actions';
import { IModel, IModelYear } from 'app/shared/states/models/models.interfaces';
import { IRequestFecthList } from 'app/shared/states/models/models.interfaces';
import {
  getModelsAsArray,
  selectCurrentModelId,
  selectYear,
} from 'app/shared/states/models/models.selectors';
import { ModelsServiceImpl } from 'app/shared/states/models/models.service';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit, OnDestroy {
  private pageTitle = 'Shop By ';
  public firstFindStep = FIND_STEP_BRAND;
  public nextFindStep = FIND_STEP_TRIM;
  public prevFindStep = FIND_STEP_BRAND;
  public currentFindStep = FIND_STEP_MODEL;

  private onDestroy$ = new Subject<void>();
  public selectedBrand$: Observable<IBrand>;
  public models$: Observable<IModel[]>;
  public selectedModelId$: Observable<number>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public brandDidFetch$: Observable<boolean>;
  public navButtonClick$: Observable<INavigator>;

  public models: IModel[] = [];
  public selectedBrand: IBrand;
  public selectedModelId: number;
  public modelYearList: Array<IModelYear>;
  public modelYearSelected: number;

  public isDataReady: boolean;

  private queryParam: object;
  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private activatedRoute: ActivatedRoute,
    private queryService$: QueryService,
    private segmentioService$: SegmentioService,
    private service$: ModelsServiceImpl
  ) {}

  ngOnInit() {
    this.isDataReady = false;
    this.segmentioService$.page(
      VIEW_MODEL_PAGE.EVENT_NAME,
      VIEW_MODEL_PAGE.PROPERTY_NAME,
      VIEW_MODEL_PAGE.SCREEN_NAME,
      VIEW_MODEL_PAGE.ACTION_NAME
    );

    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowStepper(true));
    this.store$.dispatch(new UiActions.SetShowSearchBox(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));

    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );

    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParam = params;
      if (this.queryParam && this.queryParam['brand']) {
        const queryBrandId = parseInt(this.queryParam['brand'], 10);
        if (!this.selectedBrand || this.selectedBrand.id !== queryBrandId) {
          this.store$.dispatch(new ModelActions.ClearModelList());
          this.queryService$.brandsQuery(queryBrandId);
        }
      }

      if (this.queryParam && this.queryParam['year']) {
        if (this.modelYearSelected !== this.queryParam['year']) {
          this.store$.dispatch(
            new ModelActions.UpdateYear(this.queryParam['year'])
          );
        }
      }
    });
    this.initialize();
  }

  initialize() {
    this.fetching$ = this.store$.pipe(select(state => state.model.fetching));
    this.didFetch$ = this.store$.pipe(select(state => state.model.didFetch));
    this.selectedBrand$ = this.store$.select(selectCurrentBrand);
    this.models$ = this.store$.select(getModelsAsArray);
    this.selectedModelId$ = this.store$.select(selectCurrentModelId);

    this.selectedModelId$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(modelId => (this.selectedModelId = modelId))
      )
      .subscribe();

    this.selectedBrand$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(brand => {
          this.selectedBrand = brand;
          if (brand) {
            this.store$.dispatch(
              new UiActions.SetSubHeaderTitle(this.pageTitle + brand.name)
            );
            this.loadModels();
          }
        })
      )
      .subscribe();

    this.models$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(models => {
          models.sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          });
          this.models = models;
        })
      )
      .subscribe();

    this.navButtonClick$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'previous') {
        this.router$.navigate(['/find-my-car/' + this.prevFindStep]);
      }
    }
  }

  loadModels() {
    this.store$.dispatch(new UiActions.SetLoadingStatus(true));
    combineLatest(
      this.didFetch$,
      this.service$.fetchModelYearList(this.selectedBrand.id),
      this.store$.select(selectYear)
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(([didFetch, yearList, modelYear]) => {
        if (!this.modelYearList && yearList) {
          this.modelYearList = yearList.sort((a, b) => {
            return a.id - b.id;
          });
        }
        if (
          this.modelYearList &&
          this.modelYearList.length &&
          modelYear == null
        ) {
          const defaultYearItem = this.modelYearList.find(item => item.default);
          const defaultYear = defaultYearItem
            ? defaultYearItem.id
            : new Date().getFullYear();
          this.store$.dispatch(new ModelActions.UpdateYear(defaultYear));
        }

        if (!didFetch || this.modelYearSelected !== modelYear) {
          this.modelYearSelected = modelYear;
          const request: IRequestFecthList = {
            brand_id: this.selectedBrand.id,
            year: this.modelYearSelected,
          };
          this.store$.dispatch(new ModelActions.FetchModelList(request));
          this.updateQueryParams();
          this.isDataReady = true;
        }
        this.store$.dispatch(new UiActions.SetLoadingStatus(false));
      });
  }

  updateQueryParams() {
    this.router$.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        brand: this.selectedBrand.id,
        year: this.modelYearSelected,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getModelNameFromId(id: number): string {
    const selectedModel = this.models.find(item => item.id === id);
    if (selectedModel) {
      return selectedModel.name;
    }
    return '';
  }

  onSelectModel(id: number) {
    const property_name = CLICK_ON_MODEL.PROPERTY_NAME.replace(
      'brand',
      this.selectedBrand.name
    ).replace('model', this.getModelNameFromId(id));
    this.segmentioService$.track(
      CLICK_ON_MODEL.EVENT_NAME,
      property_name,
      CLICK_ON_MODEL.SCREEN_NAME,
      CLICK_ON_MODEL.ACTION_NAME
    );
    if (this.selectedModelId !== id) {
      this.store$.dispatch(new TrimActions.ClearTrimList());
      this.store$.dispatch(new ModelActions.SelectModel(id));
    }
    this.store$.dispatch(new UiActions.SetLastStep(this.currentFindStep));
    this.router$.navigate(['find-my-car/' + this.nextFindStep], {
      queryParams: { year: this.modelYearSelected, model: id },
      queryParamsHandling: 'merge',
    });
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }

  onModelYearSelect(item) {
    if (this.modelYearSelected !== item.id) {
      this.router$.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          year: item.id,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }
}
