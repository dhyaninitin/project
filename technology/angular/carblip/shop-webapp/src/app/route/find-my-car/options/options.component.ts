import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  chromeSelectionStatus,
  FIND_STEP_BRAND,
  FIND_STEP_COLOR,
  FIND_STEP_OPTION,
  FIND_STEP_REVIEW,
} from 'app/core/constant';
import {
  CLICK_ON_OPTION,
  CLICK_ON_SEE_DETAIL_OPTION,
  VIEW_OPTION_PAGE,
} from 'app/core/events';

import { QueryService } from 'app/shared/services/query.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import {
  IExteriorColor,
  IInteriorColor,
  IOption,
  IOptionGroup,
  IRequestFecthDataById,
  IRequestToggleOption,
  IStandardEquipmentItem,
  ITechnicalSpecificationItem,
} from 'app/shared/states/configuration/configuration.interfaces';
import { IConfiguration } from 'app/shared/states/configuration/configuration.interfaces';
import { selectCurrentModel } from 'app/shared/states/models/models.selectors';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import { selectCurrentTrim } from 'app/shared/states/trim/trim.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import {
  getBackgroundImages,
  getConfiguration,
  getExteriorColorSelected,
  getInteriorColorSelected,
  getOptions,
  getOptionSelected,
  getSerializedValue,
} from 'app/shared/states/configuration/configuration.selectors';
import { IModel } from 'app/shared/states/models/models.interfaces';

import * as AuthActions from 'app/shared/states/auth/auth.actions';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit, OnDestroy {
  @ViewChild('detailModal') detailModal;

  private pageTitle = 'Preferred Options';
  public firstFindStep = FIND_STEP_BRAND;
  public prevFindStep = FIND_STEP_COLOR;
  public currentFindStep = FIND_STEP_OPTION;
  public nextFindStep = FIND_STEP_REVIEW;

  private onDestroy$ = new Subject<void>();
  public selectedOptions$: Observable<Array<IOption>>;
  public selectedTrim$: Observable<ITrim>;
  public selectedModel$: Observable<IModel>;
  public configuration$: Observable<IConfiguration>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public backgroundImages$: Observable<Array<string>>;
  public navButtonClick$: Observable<INavigator>;
  public options$: Observable<IOptionGroup>;
  public serializeValue$: Observable<string>;

  private detailModalRef: BsModalRef;

  public selectedOptions: Array<IOption>;
  public options: IOptionGroup;
  public serializeValue: string;

  public backgroundImages: Array<string> = [];
  public configuration: IConfiguration;

  public selectedBrand: IBrand;
  public selectedModel: IModel;
  public selectedTrim: ITrim;

  private queryParams: object;
  public queryConfigurationKey: string;
  public configurationState: string;

  public selectedInteriorColor: IInteriorColor;
  public selectedExteriorColor: IExteriorColor;
  public selectedInteriorColor$: Observable<IInteriorColor>;
  public selectedExteriorColor$: Observable<IExteriorColor>;

  openStatusArr: Array<boolean> = [];

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
    private authService: AuthServiceImpl,
    private modalService: BsModalService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params;
    });
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_OPTION_PAGE.EVENT_NAME,
      VIEW_OPTION_PAGE.PROPERTY_NAME,
      VIEW_OPTION_PAGE.SCREEN_NAME,
      VIEW_OPTION_PAGE.ACTION_NAME
    );

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

    if (
      this.queryParams &&
      this.queryParams['brand'] &&
      this.queryParams['year'] &&
      this.queryParams['model'] &&
      this.queryParams['trim'] &&
      this.queryParams['configurationKey']
    ) {
      const q_brand_id = this.queryParams['brand'];
      const q_year = this.queryParams['year'];
      const q_model_id = this.queryParams['model'];
      const q_trim_id = this.queryParams['trim'];
      const q_configuration_key = this.queryParams['configurationKey'];
      if (q_configuration_key) {
        this.queryConfigurationKey = q_configuration_key;
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
    this.selectedOptions$ = this.store$.select(getOptionSelected);
    this.options$ = this.store$.select(getOptions);
    this.backgroundImages$ = this.store$.select(getBackgroundImages);
    this.configuration$ = this.store$.select(getConfiguration);
    this.serializeValue$ = this.store$.select(getSerializedValue);
    this.selectedInteriorColor$ = this.store$.select(getInteriorColorSelected);
    this.selectedExteriorColor$ = this.store$.select(getExteriorColorSelected);

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

    this.serializeValue$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(serializeValue => {
          if (serializeValue) {
            this.serializeValue = serializeValue;
            this.updateQueryParams();
          }
        })
      )
      .subscribe();

    this.selectedOptions$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(selectedOptions => {
          this.selectedOptions = selectedOptions;
        })
      )
      .subscribe();

    this.options$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(options => {
          this.options = options;
        })
      )
      .subscribe();

    this.store$
      .select(selectCurrentBrand)
      .pipe(
        takeUntil(this.onDestroy$),
        tap(selectedBand => {
          this.selectedBrand = selectedBand;
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

    this.selectedTrim$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(trim => {
          if (trim) {
            this.selectedTrim = trim;
            this.loadConfiguration();
          }
        })
      )
      .subscribe();

    this.backgroundImages$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(backgroundImages => {
          this.backgroundImages = backgroundImages;
        })
      )
      .subscribe();

    this.configuration$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(configuration => {
          this.configuration = configuration;
          this.formatConfiguration();
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
    this.configurationState = this.queryConfigurationKey
      ? this.queryConfigurationKey
      : this.serializeValue;

    const request: IRequestFecthDataById = {
      configuration_state_id: this.configurationState,
    };

    this.didFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (didFetch) {
            if (this.serializeValue !== this.configurationState) {
              this.store$.dispatch(
                new ConfigurationActions.FetchConfigurationById(request)
              );
            }
          } else {
            this.store$.dispatch(
              new ConfigurationActions.FetchConfigurationById(request)
            );
          }
        })
      )
      .subscribe();

    this.updateQueryParams();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onDetailClick() {
    this.segmentioService$.track(
      CLICK_ON_SEE_DETAIL_OPTION.EVENT_NAME,
      CLICK_ON_SEE_DETAIL_OPTION.PROPERTY_NAME,
      CLICK_ON_SEE_DETAIL_OPTION.SCREEN_NAME,
      CLICK_ON_SEE_DETAIL_OPTION.ACTION_NAME
    );
    this.detailModalRef = this.modalService.show(this.detailModal, {
      class: 'modal-dialog-centered modal-lg',
    });
  }

  getOptionClass(obj: IOption) {
    return `status-${obj.selectionState.toLocaleLowerCase()}`;
  }

  getOptionType(obj: IOption) {
    const typeShows = [
      chromeSelectionStatus.included,
      chromeSelectionStatus.required,
    ];
    if (typeShows.includes(obj.selectionState)) {
      return '*' + obj.selectionState.toLocaleLowerCase();
    }
    return '';
  }

  onExpandOptionDetail(item: IOption, $event) {
    $event.stopPropagation();
    this.openStatusArr[item.chromeOptionCode] = !this.openStatusArr[
      item.chromeOptionCode
    ];
  }

  onOptionSelect(item: IOption) {
    const property_name = CLICK_ON_OPTION.PROPERTY_NAME.replace(
      '?',
      (item.descriptions.length && item.descriptions[0].description) || ''
    );
    this.segmentioService$.track(
      CLICK_ON_OPTION.EVENT_NAME,
      property_name,
      CLICK_ON_OPTION.SCREEN_NAME,
      CLICK_ON_OPTION.ACTION_NAME
    );

    if (this.selectedTrim) {
      const request: IRequestToggleOption = {
        vehicles: [this.selectedTrim.id],
        configuration_state_id: this.serializeValue,
        option: item.chromeOptionCode,
      };
      this.store$.dispatch(new ConfigurationActions.ToggleOption(request));
    }
  }

  onDismissDetailModal() {
    this.detailModalRef.hide();
  }

  isLoggedIn() {
    return this.authService.getToken();
  }

  goToNextStep() {
    this.store$.dispatch(new UiActions.SetPrevPage(this.currentFindStep));
    if (!this.isLoggedIn()) {
      this.store$.dispatch(new AuthActions.RegisterUser('registerWithCar'));
      return;
    }
    this.router$.navigate(['find-my-car/' + this.nextFindStep], {
      queryParamsHandling: 'merge',
    });
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }
}
