import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

import {
  CLICK_ON_EMAIL_PROFILE,
  CLICK_ON_FIRST_NAME_PROFILE,
  CLICK_ON_PHONE_NUMBER_PROFILE,
  CLICK_ON_SAVE_PROFILE,
  VIEW_PROFILE_PAGE,
} from 'app/core/events';
import {
  comparePhoneNumbers,
  liveFormatPhoneNumber,
} from 'app/shared/helpers/utils.helper';
import { isNumber } from 'app/shared/helpers/utils.helper';
import { IStore } from 'app/shared/interfaces/store.interface';
import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { IProfile } from 'app/shared/states/auth/auth.interfaces';
import { getUserData } from 'app/shared/states/auth/auth.selectors';
import * as UiActions from 'app/shared/states/ui/ui.actions';
import { INavigator } from 'app/shared/states/ui/ui.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  private pageTitle = 'Profile Settings';
  public countryCode = '+' + 1;

  public userDetails: IProfile;
  public isResend: boolean;

  private onDestroy$ = new Subject<void>();
  public fetching$: Observable<boolean>;
  public didFetch$: Observable<boolean>;
  public profileResult$: Observable<any>;
  public phonenoResult$: Observable<any>;
  public verifyOtpResult$: Observable<any>;
  public userData$: Observable<IProfile>;
  public navButtonClick$: Observable<INavigator>;
  public smsVerificationModalRef: BsModalRef;
  public profileForm: FormGroup;
  public otpForm: FormGroup;
  public newPhoneNumber: string;

  @ViewChild('smsVerificationModal') smsVerificationModal;

  constructor(
    private store$: Store<IStore>,
    private notificationService$: NotificationService,
    public formControlService: FormControlService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private segmentioService$: SegmentioService
  ) {}

  ngOnInit() {
    this.segmentioService$.page(
      VIEW_PROFILE_PAGE.EVENT_NAME,
      VIEW_PROFILE_PAGE.PROPERTY_NAME,
      VIEW_PROFILE_PAGE.SCREEN_NAME,
      VIEW_PROFILE_PAGE.ACTION_NAME
    );

    this.isResend = false;

    this.initSubHeader();
    this.store$.dispatch(new AuthActions.VerifyOtpClear());
    this.store$.dispatch(new AuthActions.InitializeProfileState());
    this.store$.dispatch(new AuthActions.RefreshUserData());

    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      email: ['', Validators.required],
      countryCode: ['+1', Validators.required],
      phone: ['', Validators.required],
    });

    this.otpForm = this.formBuilder.group({
      otp1: ['', Validators.required],
      otp2: ['', Validators.required],
      otp3: ['', Validators.required],
      otp4: ['', Validators.required],
      otp5: ['', Validators.required],
    });

    this.fetching$ = this.store$.pipe(select(state => state.auth.fetching));
    this.didFetch$ = this.store$.pipe(select(state => state.auth.didFetch));
    this.store$.dispatch(new AuthActions.InitializeProfileState());

    this.profileResult$ = this.store$.pipe(
      select(state => state.auth.profileResult)
    );

    this.phonenoResult$ = this.store$.pipe(
      select(state => state.auth.phonenoResult)
    );

    this.verifyOtpResult$ = this.store$.select(
      state => state.auth.verifyOtpResult
    );

    this.userData$ = this.store$.pipe(select(getUserData));

    this.userData$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(data => {
          if (typeof data !== 'undefined') {
            this.userDetails = data;
            this.profileForm.patchValue({
              firstName: data.first_name,
              email: data.email_address,
              phone: data.phone.substring(2),
            });
          }
        })
      )
      .subscribe();

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

    this.profileResult$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(profileResult => {
          if (profileResult) {
            this.store$.dispatch(new AuthActions.InitializeProfileState());
            if (profileResult.success !== '0') {
              this.store$.dispatch(new AuthActions.FetchUserData());
              this.notificationService$.success(
                'Profile has been updated successfully.'
              );
            }
          }
        })
      )
      .subscribe();

    this.phonenoResult$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(phonenoResult => {
          if (phonenoResult) {
            if (phonenoResult.success !== '0') {
              this.store$.dispatch(new AuthActions.SendPhoneForOtpClear());
              if (!this.isResend) {
                this.onShowVerificationModal();
              } else {
                this.isResend = false;
              }
            }
          }
        })
      )
      .subscribe();

    this.verifyOtpResult$.pipe(takeUntil(this.onDestroy$)).subscribe(result => {
      if (result) {
        if (result.success !== '0') {
          this.updateUserData();
          this.onDismissVerificationModal();
        }
      }
    });

    this.profileForm.valueChanges.subscribe(val => {
      this.onValueChages();
    });
  }

  onValueChages() {
    this.store$.dispatch(
      new UiActions.SetNextButtonActive(this.profileForm.valid)
    );
  }

  onNavButtonClick(data: INavigator) {
    if (data.click && data.type === 'next') {
      this.store$.dispatch(new UiActions.ClearNavigateState());
      this.store$.dispatch(new UiActions.SetShowNextLabel('Save'));

      if (this.profileForm.valid) {
        this.segmentioService$.track(
          CLICK_ON_SAVE_PROFILE.EVENT_NAME,
          CLICK_ON_SAVE_PROFILE.PROPERTY_NAME,
          CLICK_ON_SAVE_PROFILE.SCREEN_NAME,
          CLICK_ON_SAVE_PROFILE.ACTION_NAME
        );
        this.sendRequestData();
      } else {
        this.formControlService.validateAllFormFields(this.profileForm);
      }
    }
  }

  initSubHeader() {
    this.store$.dispatch(new UiActions.SetPrevPage(null));
    this.store$.dispatch(new UiActions.SetSubHeaderTitle(this.pageTitle));
    this.store$.dispatch(new UiActions.HideAllComponent());
    this.store$.dispatch(new UiActions.SetShowNextButton(true));
    this.store$.dispatch(new UiActions.SetNextButtonActive(false));
    this.store$.dispatch(new UiActions.SetShowNextLabel('Save'));
    this.store$.dispatch(new UiActions.SetShowRightBlock(true));
    this.store$.dispatch(new UiActions.SetCurrentPage(null));
  }

  sendRequestData() {
    if (this.profileForm.dirty) {
      this.newPhoneNumber = this.formatPhoneNumber(
        this.profileForm.controls.phone.value
      );
      const userPhoneNumber = this.formatPhoneNumber(this.userDetails['phone']);
      if (!comparePhoneNumbers(this.newPhoneNumber, userPhoneNumber)) {
        const data = {
          phone_number: this.newPhoneNumber,
          user_id: this.userDetails['id'],
        };
        this.store$.dispatch(new AuthActions.SendPhoneForOtp(data));
      } else {
        this.updateUserData();
      }
    }
  }
  updateUserData() {
    this.store$.dispatch(new AuthActions.VerifyOtpClear());
    const userInfo = {
      first_name: this.profileForm.controls.firstName.value,
      email_address: this.profileForm.controls.email.value,
      phone: this.profileForm.controls.phone.value,
    };
    this.store$.dispatch(new AuthActions.SendUserData(userInfo));
  }

  onShowVerificationModal() {
    this.otpForm.setValue({
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
      otp5: '',
    });
    this.smsVerificationModalRef = this.modalService.show(
      this.smsVerificationModal,
      {
        class: 'modal-dialog-centered',
      }
    );
  }

  onDismissVerificationModal() {
    if (this.smsVerificationModalRef) {
      this.smsVerificationModalRef.hide();
    }
  }

  verifyOtp() {
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
        phone: this.formatPhoneNumber(this.newPhoneNumber),
        is_register: false,
      };
      this.store$.dispatch(new AuthActions.VerifyOtp(requestObj));
    } else {
      this.notificationService$.warning('Please input all the numbers.');
    }
  }

  onResendCode() {
    this.isResend = true;
    const data = {
      phone_number: this.formatPhoneNumber(
        this.profileForm.controls.phone.value
      ),
      user_id: this.userDetails['id'],
    };
    this.store$.dispatch(new AuthActions.SendPhoneForOtp(data));
  }

  autoFocusInputField(event, position) {
    const charCode = event.which ? event.which : event.keyCode;
    const value = event.target.value;
    const currentElement = event.srcElement;
    const prevElement = event.srcElement.previousElementSibling;
    const nextElement = event.srcElement.nextElementSibling;

    // manually patch the form values

    let element = null;
    let isValidNumber = false;
    switch (charCode) {
      case 8: // backsapce
        event.target.value = null;
        element = prevElement;
        break;
      case 37: // left arrow
        // event.target.value = value;
        element = prevElement;
        break;
      case 9: // tab
      case 39: // right arrow
        // event.target.value = value;
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
        let otpDigit = '';
        if (isNumber(value)) {
          otpDigit = value;
        }
        event.target.value = otpDigit;
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

        if (isNumber(value)) {
          isValidNumber = true;
          element = nextElement;
        } else {
          event.target.value = null;
          currentElement.setSelectionRange(0, 1);
          currentElement.focus();
        }
        break;
    }
    if (element != null) {
      element.setSelectionRange(0, 1);
      element.focus();
    }
    if (this.otpForm.valid && isValidNumber) {
      this.verifyOtp();
    }
  }

  formatPhoneNumber(value) {
    return liveFormatPhoneNumber(value);
  }

  onFirstNameChange(e) {
    const value = e.srcElement.value;
    if (value) {
      const property_name = CLICK_ON_FIRST_NAME_PROFILE.PROPERTY_NAME.replace(
        '?',
        value
      );
      this.segmentioService$.track(
        CLICK_ON_FIRST_NAME_PROFILE.EVENT_NAME,
        property_name,
        CLICK_ON_FIRST_NAME_PROFILE.SCREEN_NAME,
        CLICK_ON_FIRST_NAME_PROFILE.ACTION_NAME
      );
    }
  }

  onEmailChange(e) {
    const value = e.srcElement.value;
    if (value) {
      const property_name = CLICK_ON_EMAIL_PROFILE.PROPERTY_NAME.replace(
        '?',
        value
      );
      this.segmentioService$.track(
        CLICK_ON_EMAIL_PROFILE.EVENT_NAME,
        property_name,
        CLICK_ON_EMAIL_PROFILE.SCREEN_NAME,
        CLICK_ON_EMAIL_PROFILE.ACTION_NAME
      );
    }
  }

  onPhoneNumberChange(e) {
    const value = e.srcElement.value;
    if (value) {
      const property_name = CLICK_ON_PHONE_NUMBER_PROFILE.PROPERTY_NAME.replace(
        '?',
        value
      );
      this.segmentioService$.track(
        CLICK_ON_PHONE_NUMBER_PROFILE.EVENT_NAME,
        property_name,
        CLICK_ON_PHONE_NUMBER_PROFILE.SCREEN_NAME,
        CLICK_ON_PHONE_NUMBER_PROFILE.ACTION_NAME
      );
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
