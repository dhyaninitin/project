import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

import { IStore } from 'app/shared/interfaces/store.interface';
import { SearchResultService } from 'app/shared/services/search-result.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { IBrand } from 'app/shared/states/brands/brands.interfaces';

import {
  getBackgroundImages,
  getExteriorColorSelected,
  getInteriorColorSelected,
} from 'app/shared/states/configuration/configuration.selectors';
import { IModel } from 'app/shared/states/models/models.interfaces';
import { ITrim } from 'app/shared/states/trim/trim.interfaces';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  FIND_STEP_BRAND,
  FIND_STEP_CUSTOM_REQUEST,
  FIND_STEP_CUSTOM_REQUEST_CREDIT,
  FIND_STEP_OPTION,
  FIND_STEP_REVIEW,
} from 'app/core/constant';
import { VIEW_REGISTER_PAGE } from 'app/core/events';

import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { selectCurrentBrand } from 'app/shared/states/brands/brands.selectors';
import {
  IExteriorColor,
  IInteriorColor,
} from 'app/shared/states/configuration/configuration.interfaces';
import { selectCurrentModel } from 'app/shared/states/models/models.selectors';
import { IRequest } from 'app/shared/states/request/request.interface';
import { getState } from 'app/shared/states/request/request.selectors';
import { selectCurrentTrim } from 'app/shared/states/trim/trim.selectors';
import { getPrevPage } from 'app/shared/states/ui/ui.selectors';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  @ViewChild('registerInputModal') registerInputModal;
  @ViewChild('smsVerificationModal') smsVerificationModal;

  private onDestroy$ = new Subject<void>();

  private pageTitle = 'Sign in/Register';
  public firstFindStep = FIND_STEP_BRAND;
  public nextFindStepPreference = FIND_STEP_REVIEW;
  public nextFindStepCustom = FIND_STEP_CUSTOM_REQUEST_CREDIT;
  public prevFindStep = FIND_STEP_OPTION;
  public phoneInputForm: FormGroup;
  public registerInputForm: FormGroup;
  public otpForm: FormGroup;

  public backgroundImages$: Observable<Array<string>>;
  public prevPage: string;
  public emailCheckResult$: Observable<any>;
  public registerPhoneResult$: Observable<any>;
  public verifyPhoneResult$: Observable<any>;
  public verifyOtpResult$: Observable<any>;
  public navButtonClick$: Observable<INavigator>;
  public firstName: string;
  public email: string;
  public phone: string;
  public userID: -1;
  public is_new_user: boolean;
  public otpId: number;
  private registerInputModalRef: BsModalRef;
  private smsVerificationModalRef: BsModalRef;
  public isResend: boolean;

  public selectedTrimId$: Observable<number>;
  public selectedExteriorColors$: Observable<IExteriorColor>;
  public selectedInteriorColors$: Observable<IInteriorColor>;
  public selectedOptions$: Observable<Array<number>>;
  public selectedBrand$: Observable<IBrand>;
  public selectedModel$: Observable<IModel>;
  public selectedTrim$: Observable<ITrim>;
  public request$: Observable<IRequest>;
  public models$: Observable<IModel[]>;
  public brandFetch$: Observable<boolean>;
  public modelFetch$: Observable<boolean>;
  public trimFetch$: Observable<boolean>;
  public configurationFetch$: Observable<boolean>;
  public prevPage$: Observable<string>;

  public vehicle: Array<number> = new Array<number>();
  public selectedOptions: Array<number>;
  public selectedBrandName: string;
  public selectedModelInfo: any;
  public selectedTrim: any;
  public request: any;
  public selectedExteriorColors: IExteriorColor;
  public selectedInteriorColors: IInteriorColor;
  public brandFetch: boolean;
  public modelFetch: boolean;
  public trimFetch: boolean;
  public configurationFetch: boolean;
  public count: number;
  public msrp: number;
  public selectedVehicles: Array<number> = new Array<number>();
  public backgroundImages: Array<string> = [];

  constructor(
    private store$: Store<IStore>,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private router: Router,
    public searchResultService: SearchResultService,
    public formControlService: FormControlService,
    public notificationService$: NotificationService,
    private segmentioService$: SegmentioService
  ) {}

  ngOnInit() {
    this.is_new_user = false;
    this.isResend = false;

    this.segmentioService$.page(
      VIEW_REGISTER_PAGE.EVENT_NAME,
      VIEW_REGISTER_PAGE.PROPERTY_NAME,
      VIEW_REGISTER_PAGE.SCREEN_NAME,
      VIEW_REGISTER_PAGE.ACTION_NAME
    );

    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetShowStepper(false));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new AuthActions.ClearUserInfo());
    this.phoneInputForm = this.formBuilder.group({
      phone: ['', Validators.required],
    });

    this.registerInputForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      email: ['', Validators.required],
    });

    this.otpForm = this.formBuilder.group({
      otp1: ['', Validators.required],
      otp2: ['', Validators.required],
      otp3: ['', Validators.required],
      otp4: ['', Validators.required],
      otp5: ['', Validators.required],
    });
    this.getStoreFetchState();
    this.prevPage$ = this.store$.select(getPrevPage);
    this.backgroundImages$ = this.store$.select(getBackgroundImages);
    this.selectedBrand$ = this.store$.select(selectCurrentBrand);
    this.selectedModel$ = this.store$.select(selectCurrentModel);
    this.selectedTrim$ = this.store$.select(selectCurrentTrim);
    this.request$ = this.store$.select(getState);
    this.selectedExteriorColors$ = this.store$.select(getExteriorColorSelected);
    this.selectedInteriorColors$ = this.store$.select(getInteriorColorSelected);
    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );
    this.getData();
    this.emailCheckResult$ = this.store$.select(
      state => state.auth.emailCheckResult
    );

    this.registerPhoneResult$ = this.store$.select(
      state => state.auth.registerPhoneResult
    );

    this.verifyPhoneResult$ = this.store$.select(
      state => state.auth.verifyPhoneResult
    );

    this.verifyOtpResult$ = this.store$.select(
      state => state.auth.verifyOtpResult
    );

    this.emailCheckResult$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(result => {
        if (result && result.success) {
          if (result.exists) {
            this.userID = result.user_id;
            this.phone = result.phone;
            this.smsVerificationModalRef = this.modalService.show(
              this.smsVerificationModal,
              {
                class: 'modal-dialog-centered',
              }
            );
          } else {
            this.registerInputModalRef = this.modalService.show(
              this.registerInputModal,
              {
                class: 'modal-dialog-centered',
              }
            );
          }
        }
      });

    this.registerPhoneResult$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(result => {
        if (result && result.success) {
          this.userID = result.result.user_id;
          this.onAuthSuccessful();
        }
      });

    this.verifyPhoneResult$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(result => {
        if (result) {
          if (result.success !== '0') {
            this.is_new_user = result.result.is_new_user;
            if (!this.is_new_user) {
              this.firstName = result.result.user.first_name;
            }

            if (!this.isResend) {
              this.smsVerificationModalRef = this.modalService.show(
                this.smsVerificationModal,
                {
                  class: 'modal-dialog-centered',
                }
              );
            } else {
              this.isResend = false;
            }
          }
        }
      });

    this.verifyOtpResult$.pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result) {
        if (result.success !== '0') {
          if (result.result.user_id) {
            this.userID = result.result.user_id;
            this.onAuthSuccessful();
          } else {
            this.otpId = result.result.otp_id;
            this.onDismissVerificationModal();
            this.registerInputModalRef = this.modalService.show(
              this.registerInputModal,
              {
                class: 'modal-dialog-centered',
              }
            );
          }
        }
      }
    });

    this.navButtonClick$ = this.store$.pipe(
      select(state => state.ui.navigateButtonClick)
    );
    this.navButtonClick$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => this.onNavButtonClick(data))
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
    this.prevPage$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(prevPage => {
          this.prevPage = prevPage;
        })
      )
      .subscribe();
  }

  onAuthSuccessful() {
    this.store$.dispatch(new AuthActions.VerifyPhoneClear());
    this.store$.dispatch(new AuthActions.VerifyOtpClear());
    this.store$.dispatch(new AuthActions.RegisterPhoneClear());

    this.onDismissVerificationModal();
    this.onDismissPhoneInputDialog();
    if (this.prevPage === FIND_STEP_CUSTOM_REQUEST) {
      this.router.navigate(['/custom-request/' + this.nextFindStepCustom]);
    } else {
      if (this.storesCompleted()) {
        this.router.navigate(['/find-my-car/' + this.nextFindStepPreference]);
      } else {
        this.router.navigate(['/find-my-car/' + this.firstFindStep]);
      }
    }
  }

  getStoreFetchState() {
    // store states
    this.brandFetch$ = this.store$.select(state => state.brand.didFetch);
    this.modelFetch$ = this.store$.select(state => state.model.didFetch);
    this.trimFetch$ = this.store$.select(state => state.trim.didFetch);
    this.configurationFetch$ = this.store$.select(
      state => state.configuration.didFetch
    );
    this.brandFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => (this.brandFetch = data))
      )
      .subscribe();
    this.modelFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => (this.modelFetch = data))
      )
      .subscribe();
    this.trimFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => (this.trimFetch = data))
      )
      .subscribe();
    this.configurationFetch$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(data => (this.configurationFetch = data))
      )
      .subscribe();
  }

  onDismissPhoneInputDialog() {
    if (this.registerInputModalRef) {
      this.registerInputModalRef.hide();
    }
  }

  onDismissVerificationModal() {
    if (this.smsVerificationModalRef) {
      this.smsVerificationModalRef.hide();
    }
  }
  onNavButtonClick(data) {
    if (data.click && data.type === 'next') {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      this.onVerifyPhone();
    }
    if (data.click && data.type === 'previous') {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      this.router.navigate(['find-my-car/', this.prevFindStep]);
    }
  }
  onVerifyPhone() {
    if (this.phoneInputForm.valid) {
      this.phone = this.phoneInputForm.value.phone;
      const param = {
        phone: this.phone,
      };
      this.store$.dispatch(new AuthActions.VerifyPhone(param));
    } else {
      // show messages
      this.formControlService.validateAllFormFields(this.phoneInputForm);
    }
  }

  onRegisterPhone() {
    if (this.registerInputForm.valid) {
      const email = this.registerInputForm.value.email,
        first_name = this.registerInputForm.value.firstName;
      const requestObj = {
        email_address: email,
        device_type: 'Web',
        first_name: first_name,
        otp_id: this.otpId,
        device_token: '',
        last_name: '',
      };

      this.store$.dispatch(new AuthActions.RegisterPhone(requestObj));
    } else {
      // show messages
      this.formControlService.validateAllFormFields(this.registerInputForm);
    }
  }

  onVerifyOtp() {
    if (this.otpForm.valid) {
      const optFormValue = this.otpForm.value;

      const requestObj = {
        otp: [
          optFormValue.otp1,
          optFormValue.otp2,
          optFormValue.otp3,
          optFormValue.otp4,
          optFormValue.otp5,
        ].join(''),
        phone: this.phone,
        is_register: this.is_new_user,
      };

      this.store$.dispatch(new AuthActions.VerifyOtp(requestObj));
    } else {
      this.notificationService$.warning('Please input all the numbers.');
    }
  }

  autoFocusInputField(event, position) {
    const charCode = event.which ? event.which : event.keyCode;
    const value = event.target.value;
    const prevElement = event.srcElement.previousElementSibling;
    const nextElement = event.srcElement.nextElementSibling;

    // manually patch the form values

    let element = null;
    event.target.value = null;
    switch (charCode) {
      case 8: // backsapce
        event.target.value = value;
        element = prevElement;
        return;
      case 37: // left arrow
        event.target.value = value;
        element = prevElement;
        break;
      case 9: // tab
        return;
      case 39: // right arrow
        event.target.value = value;
        element = nextElement;
        if (element != null) {
          element.setSelectionRange(0, 0);
          element.focus();
        } else {
          event.target.setSelectionRange(0, 0);
          event.target.focus();
        }
        break;
      default:
        // in case of number
        if (charCode >= 48 && charCode <= 57) {
          const otpDigit = charCode - 48;

          // manually patch form data
          switch (position) {
            case 1:
              this.otpForm.patchValue({ otp1: otpDigit });
              break;
            case 2:
              this.otpForm.patchValue({ otp2: otpDigit });
              break;
            case 3:
              this.otpForm.patchValue({ otp3: otpDigit });
              break;
            case 4:
              this.otpForm.patchValue({ otp4: otpDigit });
              break;
            case 5:
              this.otpForm.patchValue({ otp5: otpDigit });
              break;
          }

          event.target.value = otpDigit;
          element = nextElement;
        }
    }
    if (element != null) {
      element.setSelectionRange(0, 1);
      element.focus();
    }
    if (this.otpForm.valid && charCode >= 48 && charCode <= 57) {
      this.onVerifyOtp();
    }
  }

  onResendCode() {
    this.isResend = true;
    this.onVerifyPhone();
    this.notificationService$.success('OTP successfully resent!');
  }

  getData() {
    this.selectedInteriorColors$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(colors => (this.selectedInteriorColors = colors))
      )
      .subscribe();

    this.selectedExteriorColors$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(colors => (this.selectedExteriorColors = colors))
      )
      .subscribe();

    this.request$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(
          req =>
            (this.request = req
              ? {
                  year: req.user_car_information.year,
                  make: req.user_car_information.brand_id,
                  model: req.user_car_information.model_id,
                  miles: req.user_car_information.miles,
                }
              : null)
        )
      )
      .subscribe();

    this.selectedBrand$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(brand => {
          this.selectedBrandName = brand ? brand.name : null;
          if (this.storesCompleted()) {
            this.store$.dispatch(new UiActions.SetShowPrevButton(true));
          }
        })
      )
      .subscribe();

    this.selectedModel$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(
          model =>
            (this.selectedModelInfo = model
              ? {
                  name: model.name,
                  image: model.image_url,
                }
              : null)
        )
      )
      .subscribe();

    this.selectedTrim$
      .pipe(
        takeUntil(this.onDestroy$),
        tap(trim => {
          this.selectedTrim = trim
            ? { name: trim.trim, year: trim.year }
            : null;
          this.msrp = trim ? trim.price : 0;
        })
      )
      .subscribe();
  }

  storesCompleted() {
    if (
      this.brandFetch &&
      this.modelFetch &&
      this.trimFetch &&
      this.configurationFetch
    ) {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
