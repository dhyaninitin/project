import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
  getAdjustDownpaymentConfiguration,
  // getFinancePrice,
  // getLeasePrice,
} from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { combineLatest, Observable, of, range } from 'rxjs';
import { Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import {
  BUYING_METHOD_LIST,
  BUYING_TIME_LIST,
  calculation,
  FIND_STEP_BRAND,
  FIND_STEP_CREDIT,
  FIND_STEP_OPTION,
  FIND_STEP_REVIEW,
  REVIEW_POPOVER_INFO,
  SLIDER_MESSAGES,
} from 'app/core/constant';
import {
  CLICK_ON_ADD_MILE,
  CLICK_ON_ADD_PROMO_CODE,
  CLICK_ON_HAVE_A_PROMO_CODE,
  CLICK_ON_HOW_SOON_ARE,
  CLICK_ON_PLAN_TO_TRADE,
  CLICK_ON_SEE_DETAIL_REVIEW,
  CLICK_ON_SELECT_MAKE,
  CLICK_ON_SELECT_MODEL,
  CLICK_ON_SELECT_YEAR,
  CLICK_ON_YOUR_PURCHASE_PREFERENCE,
  VIEW_REVIEW_DETAIL_PAGE,
} from 'app/core/events';

import { NotificationService } from 'app/shared/services/notification.service';
import { QueryService } from 'app/shared/services/query.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import {
  getBrandsAsArray,
  selectCurrentBrand,
} from 'app/shared/states/brands/brands.selectors';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import {
  IConfiguration,
  IStandardEquipmentItem,
  ITechnicalSpecificationItem,
} from 'app/shared/states/configuration/configuration.interfaces';
import {
  IExteriorColor,
  IInteriorColor,
  IOption,
  IOptionGroup,
  IRequestFecthDataById,
} from 'app/shared/states/configuration/configuration.interfaces';
import * as LeaseActions from 'app/shared/states/lease/lease.actions';
import * as RequestActions from 'app/shared/states/request/request.actions';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import { selectCurrentTrim } from 'app/shared/states/trim/trim.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

import { CreateRequestService } from 'app/shared/services/create-request.service';
import { FormControlService } from 'app/shared/services/form-control.service';
import { IProfile } from 'app/shared/states/auth/auth.interfaces';
import { getUserData } from 'app/shared/states/auth/auth.selectors';
import {
  getBackgroundImages,
  getConfiguration,
  getExteriorColorSelected,
  getInteriorColorSelected,
  getOptionSelected,
  getSerializedValue,
} from 'app/shared/states/configuration/configuration.selectors';
import { ILease, ILeaseGroup } from 'app/shared/states/lease/lease.interfaces';
import {
  IModel,
  IRequestFecthList,
} from 'app/shared/states/models/models.interfaces';
import { ModelsServiceImpl } from 'app/shared/states/models/models.service';
import { IRequest } from 'app/shared/states/request/request.interface';
import { getState } from 'app/shared/states/request/request.selectors';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
})
export class ReviewComponent implements OnInit, OnDestroy {
  @ViewChild('addPromoModal') addPromoModal;
  @ViewChild('detailModal') detailModal;

  private addPromoModalRef: BsModalRef;
  public reviewPopoverInfo = REVIEW_POPOVER_INFO;

  private pageTitle = 'Review Details';
  public firstFindStep = FIND_STEP_BRAND;
  public prevFindStep = FIND_STEP_OPTION;
  public currentFindStep = FIND_STEP_REVIEW;
  public nextFindStep = FIND_STEP_CREDIT;

  private onDestroy$ = new Subject<void>();
  public selectedOptions$: Observable<Array<IOption>>;
  public selectedTrim$: Observable<ITrim>;
  public configuration$: Observable<IConfiguration>;
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public backgroundImages$: Observable<Array<string>>;
  public navButtonClick$: Observable<INavigator>;
  public options$: Observable<IOptionGroup>;
  public serializeValue$: Observable<string>;
  public lease$: Observable<ILeaseGroup>;
  public brands$: Observable<IBrand[]>;
  public models$: Observable<IModel[]>;
  public request$: Observable<IRequest>;
  public userData$: Observable<IProfile>;
  public didFetchBrand$: Observable<boolean>;
  public didFetchModel$: Observable<boolean>;
  public didFetchTrim$: Observable<boolean>;

  private detailModalRef: BsModalRef;

  public selectedVehicles: Array<string> = [];
  public selectedOptions: Array<IOption> = [];
  public selectedExteriorColor: IExteriorColor;
  public selectedInteriorColor: IInteriorColor;
  public options: IOptionGroup;
  public serializeValue: string;

  public backgroundImages: Array<string> = [];
  public configuration: IConfiguration;
  public userData: IProfile;

  public selectedBrand: IBrand;
  public selectedModel: IModel;
  public selectedTrim: ITrim;

  public timeDropdownOptions = [];
  public yearList = [];
  public brandList: IBrand[];
  public modelList: IModel[];
  public fromLease: boolean;
  public lease: ILease = null;
  public request: IRequest;
  public promoCode: string;
  public buyingMethod: Array<any>;

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

  public downPaymentSliderOption: any = {
    floor: 0,
    ceil: 10000,
    step: calculation.paymentStep,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public annualMilageSliderOption: any = {
    floor: 8000,
    ceil: 20000,
    stepsArray: calculation.mileageStep.map(item => {
      return {
        value: item,
      };
    }),
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public financeTermSliderOption: any = {
    floor: 12,
    ceil: 96,
    step: calculation.termStep,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public leaseTermSliderOption: any = {
    floor: 24,
    ceil: 48,
    step: calculation.termStep,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public formModel: any = {
    buyingMethod: 1,
    currentTradeMode: false,
    termInMonths: calculation.financeTerms,
    termInMonths1: calculation.leaseTerm,
    downPayment: 5000,
    downPayment1: 4500,
    annualMilage: 12000,
  };

  public userValues: any = {
    termInMonths: calculation.financeTerms,
    termInMonths1: calculation.leaseTerm,
    downPayment: 5000,
    downPayment1: 4500,
    annualMilage: 12000,
  };

  public promoInputForm: FormGroup;
  public buyingForm: FormGroup;
  public tradeForm: FormGroup;

  openStatusArr: Array<boolean> = [];
  private queryParams: object;
  public queryConfigurationKey: string;
  public isReady: Boolean = false;
  cookiePromo: string = '';

  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private segmentioService$: SegmentioService,
    public modelService: ModelsServiceImpl,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public formControlService: FormControlService,
    private createRequestService$: CreateRequestService,
    private activatedRoute: ActivatedRoute,
    private queryService$: QueryService,
    public notificationService$: NotificationService,
    private cookieService: CookieService
  ) {
    this.buyingMethod = BUYING_METHOD_LIST;
    this.activatedRoute.queryParams.subscribe(params => {
      this.queryParams = params;
    });
  }

  ngOnInit() {
    this.cookiePromo = this.cookieService.get('promoCode'); // To Get Cookie
    this.segmentioService$.page(
      VIEW_REVIEW_DETAIL_PAGE.EVENT_NAME,
      VIEW_REVIEW_DETAIL_PAGE.PROPERTY_NAME,
      VIEW_REVIEW_DETAIL_PAGE.SCREEN_NAME,
      VIEW_REVIEW_DETAIL_PAGE.ACTION_NAME
    );

    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowNextLabel('GET ME THIS CAR'));
    this.store$.dispatch(new UiActions.SetShowPrevButton(true));
    this.store$.dispatch(new UiActions.SetNextButtonActive(false));
    this.store$.dispatch(new UiActions.SetPrevButtonActive(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
    this.store$.dispatch(new UiActions.SetNextPage(this.nextFindStep));
    this.store$.dispatch(new UiActions.SetPrevPage(this.prevFindStep));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));

    this.fetching$ = this.store$.pipe(
      select(state => state.configuration.fetching)
    );
    this.didFetch$ = this.store$.pipe(
      select(state => state.configuration.didFetch)
    );
    this.selectedTrim$ = this.store$.select(selectCurrentTrim);
    this.selectedOptions$ = this.store$.select(getOptionSelected);
    this.backgroundImages$ = this.store$.select(getBackgroundImages);
    this.configuration$ = this.store$.select(getConfiguration);
    this.serializeValue$ = this.store$.select(getSerializedValue);
    this.brands$ = this.store$.select(getBrandsAsArray);
    this.request$ = this.store$.select(getState);
    this.lease$ = this.store$.select(store => store.lease);
    this.userData$ = this.store$.select(getUserData);

    this.didFetchBrand$ = this.store$.pipe(
      select(state => state.brand.didFetch)
    );
    this.didFetchModel$ = this.store$.pipe(
      select(state => state.model.didFetch)
    );
    this.didFetchTrim$ = this.store$.pipe(select(state => state.trim.didFetch));

    // Check if query params exist, fetch brand, model, trim data based on query param
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
    combineLatest(this.didFetchBrand$, this.didFetchModel$, this.didFetchTrim$)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([didFetchBrand, didFetchModel, didFetchTrim]) => {
        if (didFetchBrand && didFetchModel && didFetchTrim) {
          this.loadData();
        }
      });
  }

  loadData() {
    this.timeDropdownOptions = BUYING_TIME_LIST ? BUYING_TIME_LIST : [];
    this.promoCode = '';
    this.buyingForm = this.formBuilder.group({
      buyingTime: [null, Validators.required],
    });

    this.promoInputForm = this.formBuilder.group({
      promoCode: ['', [Validators.required, Validators.maxLength(16)]],
    });

    this.tradeForm = this.formBuilder.group({
      currentYear: ['', Validators.required],
      currentBrand: ['', Validators.required],
      currentModel: ['', Validators.required],
      miles: [0, Validators.required],
    });

    this.userData$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          if (typeof data !== 'undefined') {
            this.userData = data;
            this.store$.dispatch(
              new LeaseActions.FetchLeaseInfo({ user_id: data.id })
            );
          }
        })
      )
      .subscribe();

    combineLatest(this.request$, this.lease$)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([request, lease]) => {
        this.request = request;
        this.lease = lease;
        this.initDropdownValues();
      });

    this.brands$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => (this.brandList = data))
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

    combineLatest(
      this.serializeValue$,
      this.store$.select(getExteriorColorSelected),
      this.store$.select(getInteriorColorSelected),
      this.selectedOptions$,
      this.selectedTrim$
    )
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(
        ([
          serializeValue,
          selectedExteriorColor,
          selectedInteriorColor,
          selectedOptions,
          trim,
        ]) => {
          this.serializeValue = serializeValue;
          this.selectedExteriorColor = selectedExteriorColor;
          this.selectedInteriorColor = selectedInteriorColor;
          this.selectedOptions = selectedOptions;
          this.selectedTrim = trim;
          this.selectedVehicles = [trim.id];
          this.loadConfiguration();
          this.createReqest();
        }
      );

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
    this.initDropdowns();

    combineLatest(this.buyingForm.valueChanges, this.tradeForm.valueChanges)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([val1, val2]) => {
        this.onValueChages();
      });
      this.onAutoLoadPromoCode(this.cookiePromo);
  }

  onValueChages() {
    this.store$.dispatch(
      new UiActions.SetNextButtonActive(
        this.buyingForm.valid &&
          (!this.formModel.currentTradeMode || this.tradeForm.valid)
      )
    );
  }

  createReqest() {
    const requestObj = {
      vehicles: this.selectedVehicles,
      interior_colors: [this.selectedInteriorColor.chrome_option_code],
      interior_oem_colors: [this.selectedInteriorColor.oem_option_code],
      exterior_colors: [this.selectedExteriorColor.chrome_option_code],
      exterior_oem_colors: [this.selectedExteriorColor.oem_option_code],
      option_preferences: this.selectedOptions.map(
        item => item.chromeOptionCode
      ),
      configuration_state_id: this.serializeValue,
      is_not_complete: 1,
    };
    this.createRequestService$
      .createRequestFromPreference(requestObj)
      .pipe(
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(req => {});
  }

  initDropdownValues() {
    const { user_car_information } = this.request;
    let new_will_trade = this.formModel.currentTradeMode;
    if (user_car_information.will_trade !== null) {
      new_will_trade = user_car_information.will_trade ? true : false;
    } else if (this.lease.will_trade !== null) {
      new_will_trade = user_car_information.will_trade ? true : false;
    }
    this.formModel.currentTradeMode = new_will_trade;
    const currentYear = user_car_information.year || this.lease.year,
      currentBrand = user_car_information.brand_id || this.lease.brand_id,
      currentModel = user_car_information.model_id || this.lease.model_id,
      miles = user_car_information.miles || this.lease.miles,
      buying_time = this.request.buying_time || this.lease.buying_time,
      buying_method = this.request.buying_method || this.lease.buying_method,
      annualMilage =
        user_car_information.annual_milage || this.lease.annual_milage;

    this.tradeForm.patchValue({ currentYear });
    this.tradeForm.patchValue({ currentBrand });
    this.tradeForm.patchValue({ currentModel });
    this.tradeForm.patchValue({ miles });

    if (buying_time) {
      this.buyingForm.patchValue({ buyingTime: buying_time });
    }
    if (buying_method) {
      this.formModel.buyingMethod = buying_method;
    }

    if (user_car_information.term_in_months) {
      if (this.request.buying_method === 2) {
        this.formModel.termInMonths = user_car_information.term_in_months;
      } else if (this.request.buying_method === 3) {
        this.formModel.termInMonths1 = user_car_information.term_in_months;
      }
    } else if (this.lease.term_in_months) {
      if (this.lease.buying_method === 2) {
        this.formModel.termInMonths = this.lease.term_in_months;
      } else if (this.lease.buying_method === 3) {
        this.formModel.termInMonths1 = this.lease.term_in_months;
      }
    }

    if (user_car_information.down_payment) {
      if (this.request.buying_method === 2) {
        this.formModel.downPayment = user_car_information.down_payment;
      } else if (this.request.buying_method === 3) {
        this.formModel.downPayment1 = user_car_information.down_payment;
      }
    } else if (this.lease.down_payment) {
      if (this.lease.buying_method === 2) {
        this.formModel.downPayment = this.lease.down_payment;
      } else if (this.lease.buying_method === 3) {
        this.formModel.downPayment1 = this.lease.down_payment;
      }
    }

    if (annualMilage) {
      this.formModel.annualMilage = annualMilage;
    }

    this.userValues.annualMilage = this.formModel.annualMilage;
    this.userValues.downPayment = this.formModel.downPayment;
    this.userValues.downPayment1 = this.formModel.downPayment1;
    this.userValues.termInMonths = this.formModel.termInMonths;
    this.userValues.termInMonths1 = this.formModel.termInMonths1;

    this.modelList = [];
    this.onChangeBrand();
  }

  initDropdowns() {
    range(1990, new Date().getFullYear() - 1989).subscribe(year =>
      this.yearList.push(year)
    );
    this.yearList = this.yearList.reverse();
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

  /* Function to load configuration data from configuration key
   * @param
   * @return
   */
  loadConfiguration() {
    const configurationState = this.queryConfigurationKey
      ? this.queryConfigurationKey
      : this.serializeValue;

    const request: IRequestFecthDataById = {
      configuration_state_id: configurationState,
    };

    this.didFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (didFetch) {
            // Set isReady True when configuratoin is fully loaded
            this.isReady = true;
          } else {
            this.store$.dispatch(
              new ConfigurationActions.FetchConfigurationById(request)
            );
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  /* Function to handle change event from `How Soon` Dropdown
   * @param
   * @return
   */
  onHowSoonChange() {
    const selectedItem = this.timeDropdownOptions.find(
      item => item['id'] === this.buyingForm.value.buyingTime
    );
    const label = selectedItem ? selectedItem['label'] : '';

    const property_name = CLICK_ON_HOW_SOON_ARE.PROPERTY_NAME.replace(
      '?',
      label
    );
    this.segmentioService$.track(
      CLICK_ON_HOW_SOON_ARE.EVENT_NAME,
      property_name,
      CLICK_ON_HOW_SOON_ARE.SCREEN_NAME,
      CLICK_ON_HOW_SOON_ARE.ACTION_NAME
    );
  }

  /* Function to handle change event from `Mileage` Dropdown
   * @param e : object - event param
   * @return
   */

  onMileChange(e) {
    const value = e.srcElement.value;
    if (value) {
      const property_name = CLICK_ON_ADD_MILE.PROPERTY_NAME.replace('?', value);
      this.segmentioService$.track(
        CLICK_ON_ADD_MILE.EVENT_NAME,
        property_name,
        CLICK_ON_ADD_MILE.SCREEN_NAME,
        CLICK_ON_ADD_MILE.ACTION_NAME
      );
    }
  }

  /* Function to handle change event from `Model` Dropdown
   * @param e : object - event param
   * @return
   */

  onChangeModel(e) {
    const property_name = CLICK_ON_SELECT_MODEL.PROPERTY_NAME.replace(
      '?',
      e.name
    );
    this.segmentioService$.track(
      CLICK_ON_SELECT_MODEL.EVENT_NAME,
      property_name,
      CLICK_ON_SELECT_MODEL.SCREEN_NAME,
      CLICK_ON_SELECT_MODEL.ACTION_NAME
    );
  }

  onChangeBrand() {
    this.tradeForm.patchValue({ currentModel: null });
    this.brands$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brands => {
          const selectedBrand: IBrand = brands.find(
            brand => brand.id === this.tradeForm.value.currentBrand
          );
          if (selectedBrand) {
            const property_name = CLICK_ON_SELECT_MAKE.PROPERTY_NAME.replace(
              '?',
              selectedBrand.name
            );
            this.segmentioService$.track(
              CLICK_ON_SELECT_MAKE.EVENT_NAME,
              property_name,
              CLICK_ON_SELECT_MAKE.SCREEN_NAME,
              CLICK_ON_SELECT_MAKE.ACTION_NAME
            );

            const request: IRequestFecthList = {
              brand_id: selectedBrand.id,
              year: this.tradeForm.value.currentYear
            };

            this.modelService.fetchModelList(request).subscribe(data => {
              const { user_car_information } = this.request;
              const currentModel =
                user_car_information.model_id || this.lease.model_id;
              this.modelList = data;
              if (data.find(item => item.id === currentModel)) {
                this.tradeForm.patchValue({
                  currentModel,
                });
              }
            });
          }
        })
      )
      .subscribe();
  }

  onSelectYear() {
    const property_name = CLICK_ON_SELECT_YEAR.PROPERTY_NAME.replace(
      '?',
      this.tradeForm.value.currentYear
    );
    this.segmentioService$.track(
      CLICK_ON_SELECT_YEAR.EVENT_NAME,
      property_name,
      CLICK_ON_SELECT_YEAR.SCREEN_NAME,
      CLICK_ON_SELECT_YEAR.ACTION_NAME
    );
  }

  onDismissAddPromoModal() {
    this.addPromoModalRef.hide();
  }

  onPromoCodeAdd() {
    this.segmentioService$.track(
      CLICK_ON_HAVE_A_PROMO_CODE.EVENT_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE.PROPERTY_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE.SCREEN_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE.ACTION_NAME
    );

    this.promoInputForm.setValue({
      promoCode: this.promoCode,
    });

    this.addPromoModalRef = this.modalService.show(this.addPromoModal, {
      class: 'modal-dialog-centered promo-modal-dialog',
    });
  }

  onAutoLoadPromoCode(cookieValue){
    if(cookieValue.length > 0) {
      this.promoCode = cookieValue;
        this.promoInputForm.setValue({
          promoCode: this.promoCode,
        });
    }
  }

  onPromoCodeDelete() {
    this.promoCode = null;
  }

  onPromoCodeConfirm() {
    if (this.promoInputForm.valid) {
      if (this.promoCode === this.promoInputForm.value.promoCode) {
        this.promoCode = '';
      } else {
        this.promoCode = this.promoInputForm.value.promoCode;
      }
      const property_name = CLICK_ON_ADD_PROMO_CODE.PROPERTY_NAME.replace(
        '?',
        this.promoCode
      );
      this.segmentioService$.track(
        CLICK_ON_ADD_PROMO_CODE.EVENT_NAME,
        property_name,
        CLICK_ON_ADD_PROMO_CODE.SCREEN_NAME,
        CLICK_ON_ADD_PROMO_CODE.ACTION_NAME
      );

      this.addPromoModalRef.hide();
    } else {
      // show messages
      this.formControlService.validateAllFormFields(this.promoInputForm);
    }
  }

  onDetailClick() {
    this.segmentioService$.track(
      CLICK_ON_SEE_DETAIL_REVIEW.EVENT_NAME,
      CLICK_ON_SEE_DETAIL_REVIEW.PROPERTY_NAME,
      CLICK_ON_SEE_DETAIL_REVIEW.SCREEN_NAME,
      CLICK_ON_SEE_DETAIL_REVIEW.ACTION_NAME
    );
    this.detailModalRef = this.modalService.show(this.detailModal, {
      class: 'modal-dialog-centered modal-lg',
    });
  }

  onDismissDetailModal() {
    this.detailModalRef.hide();
  }

  goToNextStep() {
    if (this.buyingForm.valid) {
      if (!this.formModel.currentTradeMode || this.tradeForm.valid) {
        let term_in_months = null,
          down_payment = null,
          annual_milage = null;
        if (this.formModel.buyingMethod === 2) {
          down_payment = this.userValues.downPayment;
          term_in_months = this.userValues.termInMonths;
        } else if (this.formModel.buyingMethod === 3) {
          down_payment = this.userValues.downPayment1;
          term_in_months = this.userValues.termInMonths1;
          annual_milage = this.userValues.annualMilage;
        }
        const requestData = {
          buying_time: this.buyingForm.value.buyingTime,
          buying_method: this.formModel.buyingMethod,
          referral_code: [this.promoInputForm.value.promoCode],
          user_car_information: {
            will_trade: this.formModel.currentTradeMode,
            year: this.tradeForm.value.currentYear,
            brand_id: this.tradeForm.value.currentBrand,
            model_id: this.tradeForm.value.currentModel,
            miles: this.tradeForm.value.miles,
            term_in_months,
            down_payment,
            annual_milage,
          },
        };
        this.store$.dispatch(
          new RequestActions.SetRequestData({
            data: requestData,
          })
        );
        this.store$.dispatch(new UiActions.ClearNavigateState());
        this.router$.navigate(['find-my-car/' + this.nextFindStep]);
      } else {
        this.formControlService.validateAllFormFields(this.tradeForm);
      }
    } else {
      this.formControlService.validateAllFormFields(this.buyingForm);
    }
  }

  onSelectBuyingMethod(type) {
    const label = this.buyingMethod.find(item => item.id === type).label;
    const property_name = CLICK_ON_YOUR_PURCHASE_PREFERENCE.PROPERTY_NAME.replace(
      '?',
      label
    );
    this.segmentioService$.track(
      CLICK_ON_YOUR_PURCHASE_PREFERENCE.EVENT_NAME,
      property_name,
      CLICK_ON_YOUR_PURCHASE_PREFERENCE.SCREEN_NAME,
      CLICK_ON_YOUR_PURCHASE_PREFERENCE.ACTION_NAME
    );

    this.formModel.buyingMethod = type;
    const price = this.configuration.configuredResult['configuredTotalMsrp'];
    if (type === 2 || type === 3) {
      this.downPaymentSliderOption.ceil = getAdjustDownpaymentConfiguration(
        price
      );
    }
  }

  /*
   * Function to get vehicle price based on purchase type selected
   * @param type number - purchase type
   * @return
   */

  getVehiclePrice(type) {
    const price = this.configuration.configuredResult['configuredTotalMsrp'];

    // if purchase type is finance
    if (type === 2) {
      // price = getFinancePrice(
      //   price,
      //   this.userValues.downPayment,
      //   this.userValues.termInMonths,
      //   calculation.salesTax,
      //   calculation.interestRate,
      //   calculation.tradeInValue
      // );
    }

    // if purchase type is lease
    if (type === 3) {
      // price = getLeasePrice(
      //   price,
      //   this.userValues.downPayment1,
      //   this.userValues.termInMonths1,
      //   calculation.salesTax,
      //   calculation.interestRate,
      //   calculation.tradeInValue,
      //   this.userValues.annualMilage
      // );
    }
    return price;
  }

  onTradeMyCarChange(e) {
    const value = e.srcElement.value;
    this.formModel.currentTradeMode = value === 'Yes';
    this.onValueChages();
    const property_name = CLICK_ON_PLAN_TO_TRADE.PROPERTY_NAME.replace('?', e);
    this.segmentioService$.track(
      CLICK_ON_PLAN_TO_TRADE.EVENT_NAME,
      property_name,
      CLICK_ON_PLAN_TO_TRADE.SCREEN_NAME,
      CLICK_ON_PLAN_TO_TRADE.ACTION_NAME
    );
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }

  getPromoConfirmTitle() {
    if (!this.promoInputForm.value.promoCode) {
      return 'Next';
    }
    if (this.promoInputForm.value.promoCode === this.promoCode) {
      return 'Remove';
    } else {
      return 'Update';
    }
  }

  /*
   * Function to set user custom input value based on slider selection
   * @param type string - type of slider
   * @return
   */

  onFormSliderChange(type) {
    switch (type) {
      case 'termInMonths':
        this.userValues.termInMonths = this.formModel.termInMonths;
        break;

      case 'termInMonths1':
        this.userValues.termInMonths1 = this.formModel.termInMonths1;
        break;

      case 'annualMilage':
        this.userValues.annualMilage = this.formModel.annualMilage;
        break;
      case 'downPayment1':
        this.userValues.downPayment1 = this.formModel.downPayment1;
        break;

      case 'downPayment':
        this.userValues.downPayment = this.formModel.downPayment;
        break;
      default:
        break;
    }
  }

  /*
   * Function to set slider value based on custom input value
   * @param e object - event object
   * @param type string - type of slider
   * @return
   */

  onUserValueChange(e, type) {
    switch (type) {
      // handle limiation logic for custom finance term value
      case 'termInMonths':
        if (this.userValues.termInMonths < this.financeTermSliderOption.floor) {
          const msg = SLIDER_MESSAGES.minLimitMessage
            .replace('[$1]', 'finance term')
            .replace('[$2]', '1');
          this.notificationService$.warning(msg);
          this.userValues.termInMonths = 1;
        }
        this.formModel.termInMonths = this.userValues.termInMonths;
        break;

      // handle limiation logic for custom lease term value
      case 'termInMonths1':
        if (this.userValues.termInMonths1 < this.leaseTermSliderOption.floor) {
          const msg = SLIDER_MESSAGES.minLimitMessage
            .replace('[$1]', 'lease term')
            .replace('[$2]', '1');
          this.notificationService$.warning(msg);
          this.userValues.termInMonths1 = 1;
        }
        this.formModel.termInMonths1 = this.userValues.termInMonths1;
        break;

      // handle limiation logic for custom annual mileage value
      case 'annualMilage':
        if (
          this.userValues.annualMilage < this.annualMilageSliderOption.floor
        ) {
          const msg = SLIDER_MESSAGES.minLimitMessage
            .replace('[$1]', 'annual mileage')
            .replace('[$2]', '1');
          this.notificationService$.warning(msg);
          this.userValues.annualMilage = 1;
        }
        this.formModel.annualMilage = this.userValues.annualMilage;
        break;

      // handle limiation logic for custom cash down payment value
      case 'downPayment1':
        if (this.userValues.downPayment1 < this.downPaymentSliderOption.floor) {
          const msg = SLIDER_MESSAGES.minLimitMessage
            .replace('[$1]', 'down payment')
            .replace('[$2]', '$' + this.downPaymentSliderOption.floor);
          this.notificationService$.warning(msg);
          this.userValues.downPayment1 = this.downPaymentSliderOption.floor;
        } else if (
          this.userValues.downPayment1 > this.downPaymentSliderOption.ceil
        ) {
          const msg = SLIDER_MESSAGES.maxLimitMessage
            .replace('[$1]', 'down payment')
            .replace('[$2]', 'than the price of the vehicle');
          this.notificationService$.warning(msg);
          this.userValues.downPayment1 = this.downPaymentSliderOption.ceil;
        }
        this.formModel.downPayment1 = this.userValues.downPayment1;
        break;

      // handle limiation logic for custom adjust down payment value
      case 'downPayment':
        if (this.userValues.downPayment < this.downPaymentSliderOption.floor) {
          const msg = SLIDER_MESSAGES.minLimitMessage
            .replace('[$1]', 'down payment')
            .replace('[$2]', '$' + this.downPaymentSliderOption.floor);
          this.notificationService$.warning(msg);
          this.userValues.downPayment = this.downPaymentSliderOption.floor;
        } else if (
          this.userValues.downPayment > this.downPaymentSliderOption.ceil
        ) {
          const msg = SLIDER_MESSAGES.maxLimitMessage
            .replace('[$1]', 'down payment')
            .replace('[$2]', 'than the price of the vehicle');
          this.notificationService$.warning(msg);
          this.userValues.downPayment = this.downPaymentSliderOption.ceil;
        }
        this.formModel.downPayment = this.userValues.downPayment;
        break;
      default:
        break;
    }
  }
}
