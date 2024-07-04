import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  FIND_STEP_BRAND,
  FIND_STEP_COLOR,
  FIND_STEP_OPTION,
  FIND_STEP_TRIM,
} from 'app/core/constant';
import {
  CLICK_ON_EXTERIOR_COLOR,
  CLICK_ON_INTERIOR_COLOR,
  CLICK_ON_SEE_DETAIL_COLOR,
  VIEW_COLOR_PAGE,
} from 'app/core/events';

import { QueryService } from 'app/shared/services/query.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import {
  IExteriorColor,
  IInteriorColor,
  IRequestFecthData,
  IRequestFecthDataById,
  IRequestToggleOption,
  IStandardEquipmentItem,
  ITechnicalSpecificationItem,
} from 'app/shared/states/configuration/configuration.interfaces';
import { IConfiguration } from 'app/shared/states/configuration/configuration.interfaces';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import {
  selectCurrentTrim,
  selectCurrentTrimId,
} from 'app/shared/states/trim/trim.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

import {
  getBackgroundImages,
  getConfiguration,
  getExteriorColors,
  getExteriorColorSelected,
  getInteriorColors,
  getInteriorColorSelected,
  getSerializedValue,
} from 'app/shared/states/configuration/configuration.selectors';
import { IModel } from 'app/shared/states/models/models.interfaces';
import { selectCurrentModel } from 'app/shared/states/models/models.selectors';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
})
export class ColorComponent implements OnInit, OnDestroy {
  @ViewChild('detailModal') detailModal;
  @ViewChild('uiCarousel') uiCarouselRef: any;

  private pageTitle = 'Preferred Colors';
  public firstFindStep = FIND_STEP_BRAND;
  public currentFindStep = FIND_STEP_COLOR;
  public nextFindStep = FIND_STEP_OPTION;
  public prevFindStep = FIND_STEP_TRIM;

  private onDestroy$ = new Subject<void>();
  public selectedInteriorColor$: Observable<IInteriorColor>;
  public selectedExteriorColor$: Observable<IExteriorColor>;
  public selectedTrim$: Observable<ITrim>;
  public selectedModel$: Observable<IModel>;
  public selectCurrentTrimId$: Observable<number>;
  public configuration$: Observable<IConfiguration>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public backgroundImages$: Observable<Array<string>>;
  public navButtonClick$: Observable<INavigator>;
  public exteriorColors$: Observable<Array<IExteriorColor>>;
  public interiorColors$: Observable<Array<IInteriorColor>>;
  public serializeValue$: Observable<string>;

  private detailModalRef: BsModalRef;

  public selectedInteriorColor: IInteriorColor;
  public selectedExteriorColor: IExteriorColor;
  public interiorColors: Array<IInteriorColor>;
  public exteriorColors: Array<IExteriorColor>;
  public serializeValue: string;

  public backgroundImages: Array<string> = [];
  public configuration: IConfiguration;

  public selectedBrand: IBrand;
  public selectedModel: IModel;
  public selectedTrim: ITrim;
  public selectedTrimId: string;

  private queryParams: object;
  public queryConfigurationKey: string;

  standardEquipments: {
    consumerFriendlyHeaderId: number;
    consumerFriendlyHeaderName: string;
    items: Array<IStandardEquipmentItem>;
  }[];

  technicalSpecifications: {
    headerId: number;
    headerName: string;
    items: Array<ITechnicalSpecificationItem>;
  }[];

  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private activatedRoute: ActivatedRoute,
    private queryService$: QueryService,
    private segmentioService$: SegmentioService,
    private modalService: BsModalService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params;
    });
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_COLOR_PAGE.EVENT_NAME,
      VIEW_COLOR_PAGE.PROPERTY_NAME,
      VIEW_COLOR_PAGE.SCREEN_NAME,
      VIEW_COLOR_PAGE.ACTION_NAME
    );

    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowPrevButton(false));
    this.store$.dispatch(new UiActions.SetNextButtonActive(true));
    this.store$.dispatch(new UiActions.SetPrevButtonActive(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetNextPage(this.nextFindStep));
    this.store$.dispatch(new UiActions.SetPrevPage(this.prevFindStep));
    this.store$.dispatch(new UiActions.SetShowStepper(true));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));

    if (
      this.queryParams &&
      this.queryParams['brand'] &&
      this.queryParams['year'] &&
      this.queryParams['model'] &&
      this.queryParams['trim']
    ) {
      const q_brand_id = this.queryParams['brand'];
      const q_year = this.queryParams['year'];
      const q_model_id = this.queryParams['model'];
      const q_trim_id = this.queryParams['trim'];
      if (this.queryParams['configurationKey'] !== '') {
        this.queryConfigurationKey = this.queryParams['configurationKey'];
      }
      this.queryService$.trimsQuery(q_brand_id, q_model_id, q_year, q_trim_id);
      this.initialize();
    } else {
      this.initialize();
    }
  }

  initialize() {
    this.fetching$ = this.store$.pipe(
      select(state => state.configuration.fetching)
    );
    this.didFetch$ = this.store$.pipe(
      select(state => state.configuration.didFetch)
    );
    this.selectedTrim$ = this.store$.select(selectCurrentTrim);
    this.selectedModel$ = this.store$.select(selectCurrentModel);
    this.selectCurrentTrimId$ = this.store$.select(selectCurrentTrimId);
    this.selectedInteriorColor$ = this.store$.select(getInteriorColorSelected);
    this.selectedExteriorColor$ = this.store$.select(getExteriorColorSelected);
    this.backgroundImages$ = this.store$.select(getBackgroundImages);
    this.configuration$ = this.store$.select(getConfiguration);
    this.exteriorColors$ = this.store$.select(getExteriorColors);
    this.interiorColors$ = this.store$.select(getInteriorColors);
    this.serializeValue$ = this.store$.select(getSerializedValue);

    this.serializeValue$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(serializeValue => {
          if (serializeValue !== this.serializeValue) {
            this.serializeValue = serializeValue;
            this.updateQueryParams();
          }
        })
      )
      .subscribe();

    this.exteriorColors$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(exteriorColors => {
          if(exteriorColors && this.exteriorColors && exteriorColors.length < this.exteriorColors.length){
            exteriorColors = this.exteriorColors;
          } 
          this.exteriorColors = exteriorColors;
        })
      )
      .subscribe();

    this.interiorColors$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(interiorColors => {
          this.interiorColors = interiorColors;
        })
      )
      .subscribe();

    this.store$
      .select(selectCurrentBrand)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(selectedBrand => {
          this.selectedBrand = selectedBrand;
        })
      )
      .subscribe();

    this.selectedTrim$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(trim => {
          this.selectedTrim = trim;
        })
      )
      .subscribe();

    this.selectedModel$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(model => {
          this.selectedModel = model;
          this.updateQueryParams();
        })
      )
      .subscribe();

    this.selectCurrentTrimId$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(trimId => {
          if (trimId) {
            if (trimId.toString() !== this.selectedTrimId) {
              this.selectedTrimId = trimId.toString();
              this.loadConfiguration();
            }
          }
        })
      )
      .subscribe();

    this.backgroundImages$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(backgroundImages => {
          this.backgroundImages = backgroundImages;
          this.refreshData();
        })
      )
      .subscribe();

    this.selectedInteriorColor$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(selectedInteriorColor => {
          this.selectedInteriorColor = selectedInteriorColor;
        })
      )
      .subscribe();

    this.selectedExteriorColor$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(selectedExteriorColor => {
          this.selectedExteriorColor = selectedExteriorColor;
        })
      )
      .subscribe();

    this.configuration$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(configuration => {
          this.configuration = configuration;
          this.formatConfiguration();
          this.updateQueryParams();
        })
      )
      .subscribe();

    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );
    this.navButtonClick$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();
  }

  updateQueryParams() {
    const updatedBrand = this.selectedBrand ? this.selectedBrand.id : '';
    const updatedYear = this.selectedModel ? this.selectedModel.year : '';
    const updatedModel = this.selectedModel ? this.selectedModel.id : '';
    const updatedTrim = this.selectedTrim ? this.selectedTrim.id : '';
    this.router$.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        brand: updatedBrand,
        year: updatedYear,
        model: updatedModel,
        trim: updatedTrim,
        configurationKey: this.serializeValue,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  formatConfiguration() {
    const {
      standardEquipment: standardEquipments,
      technicalSpecifications: technicalSpecifications,
    } = this.configuration.vehicle_data;

    const tmp_standardEquipments = standardEquipments.reduce((newArr, item) => {
      newArr[item.consumerFriendlyHeaderId] =
        newArr[item.consumerFriendlyHeaderId] || [];
      newArr[item.consumerFriendlyHeaderId].push(item);
      return newArr;
    }, Object.create(null));
    this.standardEquipments = Object.keys(tmp_standardEquipments).map(index => {
      const tmp: Array<IStandardEquipmentItem> = tmp_standardEquipments[index];
      return {
        consumerFriendlyHeaderId: tmp[0].consumerFriendlyHeaderId,
        consumerFriendlyHeaderName: tmp[0].consumerFriendlyHeaderName,
        items: tmp,
      };
    });

    const tmp_technicalSpecifications = technicalSpecifications.reduce(
      (newArr, item) => {
        newArr[item.headerId] = newArr[item.headerId] || [];
        newArr[item.headerId].push(item);
        return newArr;
      },
      Object.create(null)
    );

    this.technicalSpecifications = Object.keys(tmp_technicalSpecifications).map(
      index => {
        const tmp: Array<ITechnicalSpecificationItem> =
          tmp_technicalSpecifications[index];
        return {
          headerId: tmp[0].headerId,
          headerName: tmp[0].headerName,
          items: tmp,
        };
      }
    );
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'next') {
        this.goToNextStep();
      }
      if (data.type === 'previous') {
        this.store$.dispatch(new UiActions.ClearNavigateState());
        this.gotToPreviousStep();
      }
    }
  }

  gotToPreviousStep() {
    this.router$.navigate(['find-my-car/' + this.prevFindStep]);
  }

  loadConfiguration() {
    const request: IRequestFecthDataById = {
      configuration_state_id: this.queryConfigurationKey,
    };

    const requestDefault: IRequestFecthData = {
      vehicles: [this.selectedTrimId],
    };

    this.didFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (!didFetch) {
            if (this.queryConfigurationKey) {
              this.store$.dispatch(
                new ConfigurationActions.FetchConfigurationById(request)
              );
            } else {
              this.store$.dispatch(
                new ConfigurationActions.FetchDefaultConfigurationList(
                  requestDefault
                )
              );
            }
          } else {
            if (this.queryConfigurationKey) {
              if (this.serializeValue !== this.queryConfigurationKey) {
                this.store$.dispatch(
                  new ConfigurationActions.FetchConfigurationById(request)
                );
              }
            }
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onExteriorSelect(item: IExteriorColor) {
    if (this.uiCarouselRef && this.uiCarouselRef.goTo) {
      this.uiCarouselRef.goTo(0);
    }

    const property_name = CLICK_ON_EXTERIOR_COLOR.PROPERTY_NAME.replace(
      '?',
      item.color
    );
    this.segmentioService$.track(
      CLICK_ON_EXTERIOR_COLOR.EVENT_NAME,
      property_name,
      CLICK_ON_EXTERIOR_COLOR.SCREEN_NAME,
      CLICK_ON_EXTERIOR_COLOR.ACTION_NAME
    );

    if (
      this.selectedExteriorColor.chrome_option_code !== item.chrome_option_code
    ) {
      const request: IRequestToggleOption = {
        vehicles: [this.selectedTrimId],
        configuration_state_id: this.serializeValue,
        option: item.chrome_option_code,
      };
      this.store$.dispatch(new ConfigurationActions.ToggleOption(request));
    }
  }

  onInteriorSelect(item: IInteriorColor) {
    const property_name = CLICK_ON_INTERIOR_COLOR.PROPERTY_NAME.replace(
      '?',
      item.color
    );
    this.segmentioService$.track(
      CLICK_ON_INTERIOR_COLOR.EVENT_NAME,
      property_name,
      CLICK_ON_INTERIOR_COLOR.SCREEN_NAME,
      CLICK_ON_INTERIOR_COLOR.ACTION_NAME
    );
    if (
      this.selectedInteriorColor.chrome_option_code !== item.chrome_option_code
    ) {
      const request: IRequestToggleOption = {
        vehicles: [this.selectedTrimId],
        configuration_state_id: this.serializeValue,
        option: item.chrome_option_code,
      };
      this.store$.dispatch(new ConfigurationActions.ToggleOption(request));
    }
  }

  onDetailClick() {
    this.segmentioService$.track(
      CLICK_ON_SEE_DETAIL_COLOR.EVENT_NAME,
      CLICK_ON_SEE_DETAIL_COLOR.PROPERTY_NAME,
      CLICK_ON_SEE_DETAIL_COLOR.SCREEN_NAME,
      CLICK_ON_SEE_DETAIL_COLOR.ACTION_NAME
    );
    this.detailModalRef = this.modalService.show(this.detailModal, {
      class: 'modal-dialog-centered modal-lg',
    });
  }

  onDismissDetailModal() {
    this.detailModalRef.hide();
  }

  goToNextStep() {
    this.store$.dispatch(new UiActions.ClearNavigateState());
    this.store$.dispatch(new UiActions.SetLastStep(this.currentFindStep));
    this.router$.navigate(['find-my-car/' + this.nextFindStep], {
      queryParams: {
        configurationKey: this.serializeValue,
      },
      queryParamsHandling: 'merge',
    });
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }

  refreshData() {
    this.changeDetectorRefs.detectChanges();
  }
}
