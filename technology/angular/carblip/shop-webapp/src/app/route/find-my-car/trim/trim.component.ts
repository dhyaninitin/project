import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { IRequestFecthList } from 'app/shared/states/trim/trim.interfaces';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';

import {
  FIND_STEP_BRAND,
  FIND_STEP_COLOR,
  FIND_STEP_MODEL,
  FIND_STEP_TRIM,
} from 'app/core/constant';
import { CLICK_ON_TRIM, VIEW_TRIM_PAGE } from 'app/core/events';

import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import { IModel } from 'app/shared/states/models/models.interfaces';
import { selectCurrentModel } from 'app/shared/states/models/models.selectors';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import * as UiActions from 'app/shared/states/ui/ui.actions';

import { QueryService } from 'app/shared/services/query.service';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import {
  getTrimAsArray,
  selectCurrentTrimId,
} from 'app/shared/states/trim/trim.selectors';
import { INavigator } from 'app/shared/states/ui/ui.interface';

@Component({
  selector: 'app-trim',
  templateUrl: './trim.component.html',
  styleUrls: ['./trim.component.scss'],
})
export class TrimComponent implements OnInit, OnDestroy {
  private pageTitle = 'Shop By ';
  public firstFindStep = FIND_STEP_BRAND;
  public nextFindStep = FIND_STEP_COLOR;
  public currentFindStep = FIND_STEP_TRIM;
  public prevFindStep = FIND_STEP_MODEL;

  private onDestroy$ = new Subject<void>();
  public trims$: Observable<ITrim[]>;
  public selectedBrand$: Observable<IBrand>;
  public selectedModel$: Observable<IModel>;
  public selectedTrimId$: Observable<number>;
  public navButtonClick$: Observable<INavigator>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;

  public trims: ITrim[] = [];
  public selectedTrimId: number;
  selectedBrand: IBrand;
  selectedModel: IModel;

  private queryParams: object;

  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private activatedRoute: ActivatedRoute,
    private queryService$: QueryService,
    private segmentioService$: SegmentioService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params;
    });
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_TRIM_PAGE.EVENT_NAME,
      VIEW_TRIM_PAGE.PROPERTY_NAME,
      VIEW_TRIM_PAGE.SCREEN_NAME,
      VIEW_TRIM_PAGE.ACTION_NAME
    );

    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );

    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowStepper(true));
    this.store$.dispatch(new UiActions.SetShowSearchBox(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetPrevPage(this.prevFindStep));
    this.store$.dispatch(new UiActions.SetShowNextButton(false));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));

    this.navButtonClick$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();

    if (
      this.queryParams &&
      this.queryParams['brand'] &&
      this.queryParams['year'] &&
      this.queryParams['model']
    ) {
      const q_brand_id = this.queryParams['brand'];
      const q_model_id = this.queryParams['model'];
      const q_year = this.queryParams['year'];
      this.store$.dispatch(new TrimActions.ClearTrimList());
      this.queryService$.modelsQuery(q_brand_id, q_model_id, q_year);
      this.initialize();
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.selectedBrand$ = this.store$.select(selectCurrentBrand);
    this.selectedModel$ = this.store$.select(selectCurrentModel);
    this.selectedTrimId$ = this.store$.select(selectCurrentTrimId);
    this.fetching$ = this.store$.pipe(select(state => state.trim.fetching));
    this.didFetch$ = this.store$.pipe(select(state => state.trim.didFetch));
    this.trims$ = this.store$.select(getTrimAsArray);

    this.selectedBrand$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(brand => {
          this.selectedBrand = brand;
        })
      )
      .subscribe();

    this.selectedTrimId$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(modelId => (this.selectedTrimId = modelId))
      )
      .subscribe();

    this.selectedModel$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(model => {
          if (model) {
            if (model !== this.selectedModel) {
              this.selectedModel = model;
              this.store$.dispatch(
                new UiActions.SetSubHeaderTitle(this.pageTitle + model.name)
              );
              this.loadTrims(model);
            }
          }
        })
      )
      .subscribe();

    this.trims$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(trims => {
          this.trims = null;
          trims.sort((a, b) => {
            return a.trim.toLowerCase() > b.trim.toLowerCase() ? 1 : -1;
          });
          this.trims = trims;
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

  loadTrims(model) {
    const request: IRequestFecthList = {
      max_price: model.max_price,
      min_price: model.min_price,
      models: [model.id],
    };
    this.store$.dispatch(new TrimActions.FetchTrimList(request));
    this.updateQueryParams();
  }

  updateQueryParams() {
    this.router$.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        brand: this.selectedBrand.id,
        year: this.selectedModel.year,
        model: this.selectedModel.id,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  getTrimNameFromId(id: number): string {
    const selectedTrim = this.trims.find(item => parseInt(item.id, 10) === id);
    if (selectedTrim) {
      return selectedTrim.trim;
    }
    return '';
  }

  onSelectTrim(id: number) {
    const property_name = CLICK_ON_TRIM.PROPERTY_NAME.replace(
      'brand',
      this.selectedBrand.name
    )
      .replace('model', this.selectedModel.name)
      .replace('trim', this.getTrimNameFromId(id));

    this.segmentioService$.track(
      CLICK_ON_TRIM.EVENT_NAME,
      property_name,
      CLICK_ON_TRIM.SCREEN_NAME,
      CLICK_ON_TRIM.ACTION_NAME
    );

    if (this.selectedTrimId !== id) {
      this.store$.dispatch(new ConfigurationActions.ClearDetail());
      this.store$.dispatch(new TrimActions.SelectTrim(id));
    }
    this.store$.dispatch(new UiActions.ClearNavigateState());
    this.store$.dispatch(new UiActions.SetLastStep(this.currentFindStep));
    this.router$.navigate(['find-my-car/' + this.nextFindStep], {
      queryParams: { trim: id },
      queryParamsHandling: 'merge',
    });
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }
}
