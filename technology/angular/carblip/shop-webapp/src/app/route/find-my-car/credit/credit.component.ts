import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { IStore } from 'app/shared/interfaces/store.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, map, takeUntil, tap } from 'rxjs/operators';

import {
  calculation,
  CREDIT_ASSESSMENT_LIST,
  FIND_STEP_BRAND,
  FIND_STEP_CREDIT,
  FIND_STEP_REVIEW,
} from 'app/core/constant';
import {
  CLICK_ON_CREDIT_EXCEL,
  CLICK_ON_CREDIT_FAIR,
  CLICK_ON_CREDIT_GOOD,
  CLICK_ON_CREDIT_POOR,
  VIEW_CREDIT_PAGE,
} from 'app/core/events';
import {
  getFinancePrice,
  getLeasePrice,
} from 'app/shared/helpers/utils.helper';

import { CreateRequestService } from 'app/shared/services/create-request.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';

import * as RequestActions from 'app/shared/states/request/request.actions';
import * as UiActions from 'app/shared/states/ui/ui.actions';

import { IProfile } from 'app/shared/states/auth/auth.interfaces';
import {
  IRequest,
  IUserCarInformation,
} from 'app/shared/states/request/request.interface';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import { INavigator } from 'app/shared/states/ui/ui.interface';

import { getUserData } from 'app/shared/states/auth/auth.selectors';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import {
  IConfiguration,
  IExteriorColor,
  IInteriorColor,
  IOption,
  IRequestFecthDataById,
} from 'app/shared/states/configuration/configuration.interfaces';
import {
  getBackgroundImages,
  getConfiguration,
  getExteriorColorSelected,
  getInteriorColorSelected,
  getOptionSelected,
  getSerializedValue,
} from 'app/shared/states/configuration/configuration.selectors';
import * as ModelActions from 'app/shared/states/models/models.actions';
import { IModel } from 'app/shared/states/models/models.interfaces';
import { getCredetScore } from 'app/shared/states/request/request.selectors';
import { getState } from 'app/shared/states/request/request.selectors';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import { selectCurrentTrim } from 'app/shared/states/trim/trim.selectors';

@Component({
  selector: 'app-credit',
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.scss'],
})
export class CreditComponent implements OnInit, OnDestroy {
  @ViewChild('requestConfirmationModal') requestConfirmationModal;

  private pageTitle = 'Credit Assessment';
  public firstFindStep = FIND_STEP_BRAND;
  public prevFindStep = FIND_STEP_REVIEW;
  public currentFindStep = FIND_STEP_CREDIT;

  private onDestroy$ = new Subject<void>();
  public creditScore$: Observable<number>;
  public navButtonClick$: Observable<INavigator>;
  public request$: Observable<IRequest>;
  public userData$: Observable<IProfile>;
  public selectedTrim$: Observable<ITrim>;
  public selectedInteriorColors$: Observable<IInteriorColor>;
  public selectedExteriorColors$: Observable<IExteriorColor>;
  public selectedOptions$: Observable<Array<IOption>>;
  public serializedValue$: Observable<string>;
  public didFetch$: Observable<boolean>;
  public configuration$: Observable<IConfiguration>;
  public backgroundImages$: Observable<Array<string>>;
  public didFetchBrand$: Observable<boolean>;
  public didFetchModel$: Observable<boolean>;
  public didFetchTrim$: Observable<boolean>;

  public userData: IProfile;
  public request: IRequest;

  public selectedId = null;
  public showErrorMsg = false;
  public creditAssessmentList = [];

  public backgroundImages: Array<string> = [];
  public configuration: IConfiguration;
  public selectedVehicles: Array<string> = [];
  public selectedInteriorColors: IInteriorColor;
  public selectedExteriorColors: IExteriorColor;
  public selectedOptions: Array<IOption>;
  public serializedValue: string;
  public selectedBrand: IBrand;
  public selectedModel: IModel;
  public selectedTrim: ITrim;

  public isReady = false;

  private requestConfirmationModalRef: BsModalRef;

  constructor(
    private store$: Store<IStore>,
    private router$: Router,
    private notificationService$: NotificationService,
    private createRequestService$: CreateRequestService,
    private segmentioService$: SegmentioService,
    private modalService: BsModalService
  ) {
    this.didFetch$ = this.store$.pipe(
      select(state => state.configuration.didFetch)
    );
    this.backgroundImages$ = this.store$.select(getBackgroundImages);
    this.configuration$ = this.store$.select(getConfiguration);
    this.selectedTrim$ = this.store$.select(selectCurrentTrim);
    this.selectedInteriorColors$ = this.store$.select(getInteriorColorSelected);
    this.selectedExteriorColors$ = this.store$.select(getExteriorColorSelected);
    this.selectedOptions$ = this.store$.select(getOptionSelected);
    this.request$ = this.store$.select(getState);
    this.userData$ = this.store$.select(getUserData);
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_CREDIT_PAGE.EVENT_NAME,
      VIEW_CREDIT_PAGE.PROPERTY_NAME,
      VIEW_CREDIT_PAGE.SCREEN_NAME,
      VIEW_CREDIT_PAGE.ACTION_NAME
    );

    this.initSubHeader();

    this.didFetchBrand$ = this.store$.pipe(
      select(state => state.brand.didFetch)
    );
    this.didFetchModel$ = this.store$.pipe(
      select(state => state.model.didFetch)
    );
    this.didFetchTrim$ = this.store$.pipe(select(state => state.trim.didFetch));

    combineLatest(
      this.didFetch$,
      this.didFetchBrand$,
      this.didFetchModel$,
      this.didFetchTrim$
    )
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(
        ([
          didFetchConfiguration,
          didFetchBrand,
          didFetchModel,
          didFetchTrim,
        ]) => {
          if (
            didFetchConfiguration &&
            didFetchBrand &&
            didFetchModel &&
            didFetchTrim
          ) {
            this.initialize();
          } else {
            this.goToFirstStep();
          }
        }
      );
  }

  initialize() {
    this.creditAssessmentList = CREDIT_ASSESSMENT_LIST
      ? CREDIT_ASSESSMENT_LIST
      : [];

    this.serializedValue$ = this.store$.select(getSerializedValue);
    this.serializedValue$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(serializedValue => {
          this.serializedValue = serializedValue;
        })
      )
      .subscribe();

    // get selected score
    this.creditScore$ = this.store$.select(getCredetScore);
    this.creditScore$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(selectedId => {
          this.selectedId = selectedId;
          this.onValueChages();
        })
      )
      .subscribe();
    // next button clicked
    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );
    this.navButtonClick$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          this.onNavButtonClick(data);
        })
      )
      .subscribe();

    this.selectedTrim$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(trim => {
          this.selectedTrim = trim;
          this.selectedVehicles = [trim.id];
          this.loadConfiguration(trim);
        })
      )
      .subscribe();

    this.selectedInteriorColors$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(colors => (this.selectedInteriorColors = colors))
      )
      .subscribe();

    this.selectedExteriorColors$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(colors => (this.selectedExteriorColors = colors))
      )
      .subscribe();

    this.selectedOptions$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(options => {
          this.selectedOptions = options;
        })
      )
      .subscribe();

    this.request$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(req => (this.request = req))
      )
      .subscribe();

    this.userData$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          if (typeof data !== 'undefined') {
            this.userData = data;
          }
        })
      )
      .subscribe();

    this.store$
      .select(selectCurrentBrand)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(selectedBand => {
          this.selectedBrand = selectedBand;
        })
      )
      .subscribe();

    this.backgroundImages$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(backgroundImages => {
          this.backgroundImages = backgroundImages;
        })
      )
      .subscribe();

    this.configuration$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(configuration => {
          this.configuration = configuration;
          this.isReady = true;
        })
      )
      .subscribe();
  }

  onValueChages() {
    this.store$.dispatch(
      new UiActions.SetNextButtonActive(this.selectedId !== null)
    );
  }

  loadConfiguration(trim) {
    const configurationState = this.serializedValue;

    const request: IRequestFecthDataById = {
      configuration_state_id: configurationState,
    };

    this.didFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(didFetch => {
          if (!didFetch) {
            this.store$.dispatch(
              new ConfigurationActions.FetchConfigurationById(request)
            );
          }
        })
      )
      .subscribe();
  }

  onNavButtonClick(data: INavigator) {
    if (data.click && data.type === 'next') {
      if (this.selectedId === null) {
        this.notificationService$.warning(
          'Please make a selection in order to continue.'
        );
        return;
      }
      this.goToNextStep();
    }
    if (data.click && data.type === 'previous') {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      this.goToPrevStep();
    }
  }

  goToNextStep() {
    const userCarInfo: UserCarInfo = {};
    if (
      this.request.hasOwnProperty('user_car_information') &&
      this.request.user_car_information
    ) {
      const request: IUserCarInformation = this.request.user_car_information;
      userCarInfo.will_trade = request.will_trade;
      if (request.hasOwnProperty('brand_id')) {
        userCarInfo.brand_id = request.brand_id;
      }
      if (request.hasOwnProperty('miles')) {
        userCarInfo.miles = request.miles;
      }
      if (request.hasOwnProperty('model_id')) {
        userCarInfo.model_id = request.model_id;
      }
      if (request.hasOwnProperty('term_in_months')) {
        userCarInfo.term_in_months = request.term_in_months;
      }
      if (request.hasOwnProperty('down_payment')) {
        userCarInfo.down_payment = request.down_payment;
      }
      if (request.hasOwnProperty('annual_milage')) {
        userCarInfo.annual_milage = request.annual_milage;
      }

      if (request.hasOwnProperty('year')) {
        userCarInfo.year = request.year;
      }
    }
    const requestObj = {
      vehicles: this.selectedVehicles,
      interior_colors: [this.selectedInteriorColors.chrome_option_code],
      interior_oem_colors: [this.selectedInteriorColors.oem_option_code],
      exterior_colors: [this.selectedExteriorColors.chrome_option_code],
      exterior_oem_colors: [this.selectedExteriorColors.oem_option_code],
      option_preferences: this.selectedOptions.map(
        item => item.chromeOptionCode
      ),
      ...this.request,
      user_car_information: userCarInfo,
      buying_time: this.request.buying_time,
      buying_method: this.request.buying_method,
      credit_score: this.selectedId,
      referral_code: this.request.referral_code.join(','),
      configuration_state_id: this.serializedValue,
      is_not_complete: 0,
    };

    this.store$.dispatch(new UiActions.SetLoadingStatus(true));
    this.createRequestService$
      .createRequestFromPreference(requestObj)
      .pipe(
        map(result => result),
        catchError(err => {
          return of(err);
        })
      )
      .subscribe(req => {
        this.store$.dispatch(new UiActions.SetLoadingStatus(false));
        if (req && req.success) {
          this.requestConfirmationModalRef = this.modalService.show(
            this.requestConfirmationModal,
            {
              class: 'modal-dialog-centered',
              ignoreBackdropClick: true,
            }
          );
        }
      });
  }

  confirmRequest() {
    if (this.requestConfirmationModalRef) {
      this.requestConfirmationModalRef.hide();
    }
    this.store$.dispatch(new UiActions.ClearNavigateState());
    this.store$.dispatch(new ModelActions.ClearModelList());
    this.store$.dispatch(new TrimActions.ClearTrimList());
    this.store$.dispatch(new ConfigurationActions.ClearDetail());

    this.router$.navigate(['my-request']);
  }

  goToPrevStep() {
    this.router$.navigate(['find-my-car/' + this.prevFindStep]);
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.SetShowNextLabel('Submit'));
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetNextButtonActive(false));
    this.store$.dispatch(new UiActions.SetShowPrevButton(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowSearchBox(false));
    this.store$.dispatch(new UiActions.SetShowBackIcon(true));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
  }

  getVehiclePrice(type) {
    let price = this.configuration.configuredResult['configuredTotalMsrp'];
    let down_payment = 0,
      term_in_months = 0,
      annual_milage = 0;
    if (
      this.request.hasOwnProperty('user_car_information') &&
      this.request.user_car_information
    ) {
      const userCarInfo: IUserCarInformation = this.request
        .user_car_information;
      down_payment = userCarInfo.down_payment;
      term_in_months = userCarInfo.term_in_months;
      annual_milage = userCarInfo.annual_milage;
    }
    if (type === 2) {
      price = getFinancePrice(
        price,
        down_payment,
        term_in_months,
        calculation.salesTax,
        calculation.interestRate,
        calculation.tradeInValue
      );
    }
    if (type === 3) {
      price = getLeasePrice(
        price,
        down_payment,
        term_in_months,
        calculation.salesTax,
        calculation.interestRate,
        calculation.tradeInValue,
        annual_milage
      );
    }
    return price;
  }

  getSelectedCreditName(id: number) {
    const selectedItem = this.creditAssessmentList.find(
      item => item['id'] === id
    );
    const label = selectedItem ? selectedItem['label'] : '';
    return label;
  }

  onSelectScore(credit_id: number) {
    this.selectedId = credit_id;
    this.store$.dispatch(new RequestActions.SetCreditScore(this.selectedId));
    this.onValueChages();
    switch (this.getSelectedCreditName(credit_id)) {
      case 'Excellent':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_EXCEL.EVENT_NAME,
          CLICK_ON_CREDIT_EXCEL.PROPERTY_NAME,
          CLICK_ON_CREDIT_EXCEL.SCREEN_NAME,
          CLICK_ON_CREDIT_EXCEL.ACTION_NAME
        );
        break;
      case 'Good':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_GOOD.EVENT_NAME,
          CLICK_ON_CREDIT_GOOD.PROPERTY_NAME,
          CLICK_ON_CREDIT_GOOD.SCREEN_NAME,
          CLICK_ON_CREDIT_GOOD.ACTION_NAME
        );
        break;
      case 'Fair':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_FAIR.EVENT_NAME,
          CLICK_ON_CREDIT_FAIR.PROPERTY_NAME,
          CLICK_ON_CREDIT_FAIR.SCREEN_NAME,
          CLICK_ON_CREDIT_FAIR.ACTION_NAME
        );
        break;
      case 'Poor':
        this.segmentioService$.track(
          CLICK_ON_CREDIT_POOR.EVENT_NAME,
          CLICK_ON_CREDIT_POOR.PROPERTY_NAME,
          CLICK_ON_CREDIT_POOR.SCREEN_NAME,
          CLICK_ON_CREDIT_POOR.ACTION_NAME
        );
        break;
      default:
        break;
    }
  }

  goToFirstStep() {
    this.router$.navigate(['find-my-car/' + this.firstFindStep]);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}

interface UserCarInfo {
  [key: string]: any;
}
