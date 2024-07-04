import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  BUYING_METHOD_LIST,
  BUYING_TIME_LIST,
  FIND_STEP_BRAND,
  FIND_STEP_CUSTOM_REQUEST,
  FIND_STEP_CUSTOM_REQUEST_CREDIT,
  VEHICLE_TYPE_LIST,
} from 'app/core/constant';
import {
  CLICK_ON_ADD_PROMO_CODE_CUSTOM,
  CLICK_ON_HAVE_A_PROMO_CODE_CUSTOM,
  CLICK_ON_HOW_SOON_ARE_CUSTOM,
  CLICK_ON_PAYMENT_TYPE,
  CLICK_ON_VEHICLE_TYPE,
  CLICK_ON_YOUR_PURCHASE_PREFERENCE_CUSTOM,
  VIEW_CUSTOM_REQUEST_PAGE,
} from 'app/core/events';
import { kFormatter, numberWithCommas } from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { FormControlService } from 'app/shared/services/form-control.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import { SetRequestData } from 'app/shared/states/custom-request/custom-request.actions';
import { ICustomRequest } from 'app/shared/states/custom-request/custom-request.interface';
import { getState } from 'app/shared/states/custom-request/custom-request.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';

@Component({
  selector: 'app-custom-request-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class CustomRequestSearchComponent implements OnInit, OnDestroy {
  @ViewChild('addPromoModal') addPromoModal;
  private addPromoModalRef: BsModalRef;

  private pageTitle = 'Custom Request';
  public firstFindStep = FIND_STEP_BRAND;
  public prevFindStep = FIND_STEP_BRAND;
  public currentFindStep = FIND_STEP_CUSTOM_REQUEST;
  public nextFindStep = FIND_STEP_CUSTOM_REQUEST_CREDIT;

  public customRequestForm: FormGroup;
  public promoInputForm: FormGroup;

  private onDestroy$ = new Subject<void>();
  public navButtonClick$: Observable<INavigator>;
  public customRequest$: Observable<ICustomRequest>;

  public customRequest: ICustomRequest;
  public vehicleList = VEHICLE_TYPE_LIST;
  public buyingTimeList = BUYING_TIME_LIST;
  public buyingMethodList = BUYING_METHOD_LIST;
  public vehiclePrice: number;
  public vehicleMonthlyPrice: number;

  public paymentType: boolean;
  public promoCode: string;

  public vehiclePriceSliderOption = {
    floor: 25000,
    ceil: 100000,
    step: 1000,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  public vehicleMonthlyPriceSliderOption = {
    floor: 100,
    ceil: 1500,
    step: 100,
    showTicks: false,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
  };

  constructor(
    private store$: Store<IStore>,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    public formControlService: FormControlService,
    private router$: Router,
    private authService$: AuthServiceImpl,
    private segmentioService$: SegmentioService
  ) {
    this.customRequest$ = this.store$.select(getState);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_CUSTOM_REQUEST_PAGE.EVENT_NAME,
      VIEW_CUSTOM_REQUEST_PAGE.PROPERTY_NAME,
      VIEW_CUSTOM_REQUEST_PAGE.SCREEN_NAME,
      VIEW_CUSTOM_REQUEST_PAGE.ACTION_NAME
    );

    this.vehiclePrice = 50000;
    this.vehicleMonthlyPrice = 800;
    this.initSubHeader();

    this.customRequestForm = this.formBuilder.group({
      vehicleType: [null, Validators.required],
      buyingTime: [null, Validators.required],
      buyingMethod: [null, Validators.required],
    });

    this.promoInputForm = this.formBuilder.group({
      promoCode: ['', [Validators.required, Validators.maxLength(16)]],
    });

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

    this.customRequestForm.valueChanges.subscribe(val => {
      this.onValueChages();
    });

    this.customRequest$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => {
          this.customRequest = data;
          this.initData();
        })
      )
      .subscribe();
  }

  initData() {
    this.customRequestForm.patchValue({
      vehicleType: this.customRequest.vehicle_type,
    });
    this.customRequestForm.patchValue({
      buyingMethod: this.customRequest.buying_method,
    });
    this.customRequestForm.patchValue({
      buyingTime: this.customRequest.buying_time,
    });
    this.promoInputForm.patchValue({
      promoCode: this.customRequest.referral_code[0],
    });
    this.promoCode = this.customRequest.referral_code[0];
    this.paymentType = this.customRequest.price_type;
    if (this.customRequest.price_type) {
      this.vehicleMonthlyPrice = this.customRequest.max_price;
    } else {
      this.vehiclePrice = this.customRequest.max_price;
    }
  }

  onValueChages() {
    this.store$.dispatch(
      new UiActions.SetNextButtonActive(this.customRequestForm.valid)
    );
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetNextButtonActive(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(this.currentFindStep));
  }

  onNavButtonClick(data: INavigator) {
    if (data.click) {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      if (data.type === 'next') {
        this.goToNextStep();
      }
    }
  }

  isLoggedIn() {
    return this.authService$.getToken();
  }

  goToNextStep() {
    if (this.customRequestForm.valid) {
      const maxPrice = this.paymentType
        ? this.vehicleMonthlyPrice
        : this.vehiclePrice;
      const minPrice = this.paymentType ? 100 : 25000;
      const referralCode = [this.promoCode];
      const payload: ICustomRequest = {
        vehicle_type: this.customRequestForm.value.vehicleType,
        price_type: this.paymentType,
        buying_time: this.customRequestForm.value.buyingTime,
        buying_method: this.customRequestForm.value.buyingMethod,
        min_price: minPrice,
        max_price: maxPrice,
        referral_code: referralCode,
        credit_score: this.customRequest.credit_score,
      };
      this.store$.dispatch(new UiActions.ClearNavigateState());

      this.store$.dispatch(new SetRequestData({ data: payload }));
      this.store$.dispatch(new UiActions.SetPrevPage(this.currentFindStep));

      if (!this.isLoggedIn()) {
        this.store$.dispatch(
          new AuthActions.RegisterUser('registerCustomRequest')
        );
        return;
      }
      this.router$.navigate(['custom-request/' + this.nextFindStep]);
    } else {
      this.formControlService.validateAllFormFields(this.customRequestForm);
    }
  }

  getVehiclePrice() {
    if (this.paymentType === false) {
      if (this.vehiclePrice === this.vehiclePriceSliderOption.ceil) {
        return 'Any Price';
      } else {
        return '$' + kFormatter(this.vehiclePrice);
      }
    } else {
      if (
        this.vehicleMonthlyPrice === this.vehicleMonthlyPriceSliderOption.ceil
      ) {
        return 'Any Price';
      } else {
        return '$' + numberWithCommas(this.vehicleMonthlyPrice);
      }
    }
  }

  onPromoCodeAdd() {
    this.segmentioService$.track(
      CLICK_ON_HAVE_A_PROMO_CODE_CUSTOM.EVENT_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE_CUSTOM.PROPERTY_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE_CUSTOM.SCREEN_NAME,
      CLICK_ON_HAVE_A_PROMO_CODE_CUSTOM.ACTION_NAME
    );
    this.addPromoModalRef = this.modalService.show(this.addPromoModal, {
      class: 'modal-dialog-centered promo-modal-dialog',
    });
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
      const property_name = CLICK_ON_ADD_PROMO_CODE_CUSTOM.PROPERTY_NAME.replace(
        '?',
        this.promoCode
      );
      this.segmentioService$.track(
        CLICK_ON_ADD_PROMO_CODE_CUSTOM.EVENT_NAME,
        property_name,
        CLICK_ON_ADD_PROMO_CODE_CUSTOM.SCREEN_NAME,
        CLICK_ON_ADD_PROMO_CODE_CUSTOM.ACTION_NAME
      );
      this.addPromoModalRef.hide();
    } else {
      // show messages
      this.formControlService.validateAllFormFields(this.promoInputForm);
    }
  }

  onDismissAddPromoModal() {
    this.addPromoModalRef.hide();
  }

  onPaymentTypeChange(e) {
    const property_name = CLICK_ON_PAYMENT_TYPE.PROPERTY_NAME.replace('?', e);
    this.segmentioService$.track(
      CLICK_ON_PAYMENT_TYPE.EVENT_NAME,
      property_name,
      CLICK_ON_PAYMENT_TYPE.SCREEN_NAME,
      CLICK_ON_PAYMENT_TYPE.ACTION_NAME
    );
  }

  onChangeVehicleType(e) {
    if (e) {
      const property_name = CLICK_ON_VEHICLE_TYPE.PROPERTY_NAME.replace(
        '?',
        e.label
      );
      this.segmentioService$.track(
        CLICK_ON_VEHICLE_TYPE.EVENT_NAME,
        property_name,
        CLICK_ON_VEHICLE_TYPE.SCREEN_NAME,
        CLICK_ON_VEHICLE_TYPE.ACTION_NAME
      );
    }
  }

  onChangeBuyingTime(e) {
    if (e) {
      const property_name = CLICK_ON_HOW_SOON_ARE_CUSTOM.PROPERTY_NAME.replace(
        '?',
        e.label
      );
      this.segmentioService$.track(
        CLICK_ON_HOW_SOON_ARE_CUSTOM.EVENT_NAME,
        property_name,
        CLICK_ON_HOW_SOON_ARE_CUSTOM.SCREEN_NAME,
        CLICK_ON_HOW_SOON_ARE_CUSTOM.ACTION_NAME
      );
    }
  }

  onChangeBuyingMethod(e) {
    if (e) {
      const property_name = CLICK_ON_YOUR_PURCHASE_PREFERENCE_CUSTOM.PROPERTY_NAME.replace(
        '?',
        e.label
      );
      this.segmentioService$.track(
        CLICK_ON_YOUR_PURCHASE_PREFERENCE_CUSTOM.EVENT_NAME,
        property_name,
        CLICK_ON_YOUR_PURCHASE_PREFERENCE_CUSTOM.SCREEN_NAME,
        CLICK_ON_YOUR_PURCHASE_PREFERENCE_CUSTOM.ACTION_NAME
      );
    }
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
}
