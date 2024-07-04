import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { IStore } from 'app/shared/interfaces/store.interface';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { NOTIFICATION_LIST } from 'app/core/constant';
import { APP_LOGIN, APP_REGISTRATION } from 'app/core/events';
import { isNumber } from 'app/shared/helpers/utils.helper';
import { FormControlService } from 'app/shared/services/form-control.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { SegmentioService } from 'app/shared/services/segmentio.service';
import * as AuthActions from 'app/shared/states/auth/auth.actions';
import { AuthEffects } from 'app/shared/states/auth/auth.effects';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('phoneNumberInputModal') phoneNumberInputModal;
  @ViewChild('otpVerificationModal') otpVerificationModal;
  @ViewChild('nameModal') nameModal;
  @ViewChild('emailModal') emailModal;
  @ViewChild('lastNameModal') lastNameModal;
  @ViewChild('zipCodeModal') zipCodeModal;


  siteKey: string = "6LfwKb8eAAAAAMyp6DgwLDWHWYRhJBIXCVP9YBB0";
  
  verifiedCaptha: boolean = true;

  private onDestroy$ = new Subject<void>();
  public verifyPhoneResult$: Observable<any>;
  public verifyOtpResult$: Observable<any>;
  public registerPhoneResult$: Observable<any>;
  public registerUser$: Observable<any>;
  public authMessage$: Observable<string>;
  public authRedirect$: Observable<string>;

  public errorphone$: Observable<any>;

  public action: string;
  public isResend: boolean;
  public is_new_user: boolean;
  public phone: string;
  public firstName: string;
  public userId: string;
  public otpId: string;
  public authRedirect: string;

  public phoneInputFocused: boolean;
  private phoneNumberInputModalRef: BsModalRef;
  private otpVerificationModalRef: BsModalRef;
  private nameModalRef: BsModalRef;
  private emailModalRef: BsModalRef;
  private lastNameModalRef: BsModalRef;
  private zipCodeModalRef: BsModalRef;
  public phoneNumberInputForm: FormGroup;
  public otpForm: FormGroup;
  public registerUserForm: FormGroup;
  
  public counts:number = 0;
  subtimer:Subscription;
  tokencaptcha:string;
  disableNextButton: boolean = false;
  callCounter: number = -1;
  countDown: string = "";
  timer: any;
  enableResendButton: boolean = false;
  hideNextButton: boolean = false;

  constructor(
    private router$: Router,
    private store$: Store<IStore>,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public formControlService: FormControlService,
    public notificationService$: NotificationService,
    private segmentioService$: SegmentioService,
    private autheffect$:AuthEffects,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.is_new_user = false;
    this.action = '';
    this.phoneInputFocused = true;
    this.isResend = false;

    this.phoneNumberInputForm = this.formBuilder.group({
      phoneNumber: ['', Validators.required],
    });

    this.otpForm = this.formBuilder.group({
      otp1: ['', Validators.required],
      otp2: ['', Validators.required],
      otp3: ['', Validators.required],
      otp4: ['', Validators.required],
      otp5: ['', Validators.required],
    });

    this.registerUserForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      zipcode: ['', Validators.required],
      email: ['', Validators.required],
      
    });

    this.modalService.onHide.subscribe(() => {
      this.store$.dispatch(new AuthActions.VerifyPhoneClear());
      this.store$.dispatch(new AuthActions.VerifyOtpClear());
      this.store$.dispatch(new AuthActions.RegisterPhoneClear());
    });

    this.verifyPhoneResult$ = this.store$.select(
      state => state.auth.verifyPhoneResult
    );

    this.verifyOtpResult$ = this.store$.select(
      state => state.auth.verifyOtpResult
    );

    this.registerPhoneResult$ = this.store$.select(
      state => state.auth.registerPhoneResult
    );

    this.registerUser$ = this.store$.select(state => state.auth.registerUser);
    this.authMessage$ = this.store$.select(state => state.auth.authMessage);
    this.authRedirect$ = this.store$.select(state => state.auth.authRedirect);
    this.errorphone$ = this.store$.select(state => state.auth.errors);

    this.registerUser$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        if (result !== '') {
          this.action = result;
          this.onShowPhoneModal();
          this.store$.dispatch(new AuthActions.RegisterUserClear());
        }
      });

    this.errorphone$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        if(result.length > 0){
          if(result[0].error){
            if(result[0].error.time){
              this.counttimer(result[0].error.time);
            }
          }
        }
      });
    this.authRedirect$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        this.authRedirect = result;
      });

    this.verifyPhoneResult$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        if (result) {
          if (result.success !== '0') {
            this.disableNextButton = false;
            this.enableResendButton = false;
            this.callCounter += 1;
            if(this.callCounter > 0) {
              this.getWaitTime();
            }
            this.is_new_user = result.result.is_new_user;
            if (!this.is_new_user) {
              this.firstName = result.result.user.first_name;
            }
            if (!this.isResend) {
              this.onShowOtpVerificationModal();
            } else {
              this.isResend = false;
            }
          }
        }
      });

    this.verifyOtpResult$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        if (result) {
          if (result.success !== '0') {
            if (result.result.user_id) {
              this.userId = result.result.user_id;
              this.onAuthSuccessfull();
            } else {
              this.otpId = result.result.otp_id;
              this.onDismissVerificationModal();
              this.onShowNameModal();
            }
          }
        }
      });

    this.registerPhoneResult$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$)
      )
      .subscribe(result => {
        if (result && result.success) {
          this.userId = result.result.user_id;
          this.onAuthSuccessfull();
        } else {
          this.hideNextButton = false;
        }
      });
  }

  counttimer(count){
    this.counts = count;
    let timerCount = timer(1000,1000);
    this.subtimer = timerCount.subscribe(res =>{
      if(this.counts === 0){
        this.subtimer.unsubscribe();
      } else {
        this.counts = --this.counts;
      }
    })

  }

  onAuthSuccessfull() {
    if (['', 'expired'].includes(this.action)) {
      this.segmentioService$.identify(
        this.userId,
        APP_LOGIN.EVENT_NAME,
        APP_LOGIN.PROPERTY_NAME,
        APP_LOGIN.SCREEN_NAME
      );
    } else {
      this.segmentioService$.identify(
        this.userId,
        APP_REGISTRATION.EVENT_NAME,
        APP_REGISTRATION.PROPERTY_NAME,
        APP_REGISTRATION.SCREEN_NAME
      );
    }

    this.onDismissEmailModal();
    this.onDismissVerificationModal();
    switch (this.action) {
      case 'registerWithCar':
        this.router$.navigate(['find-my-car/review']);
        break;
      case 'registerCustomRequest':
        this.router$.navigate(['custom-request/credit']);
        break;
      case 'expired':
        this.router$.navigate([this.authRedirect]);
        break;
      default:
        break;
    }
  }

  onVerifyPhone(Roletype = null) {
    if (this.phoneNumberInputForm.valid) {
      this.disableNextButton = true;
      clearInterval(this.timer);
      if(this.phone != this.phoneNumberInputForm.value.phoneNumber) {
        this.callCounter = -1;
      }
      this.phone = this.phoneNumberInputForm.value.phoneNumber;
      const param = {
        phone: this.phone,
        tokencaptcha:this.tokencaptcha
      };
      if(Roletype !=null) {
        param['type'] = 'resend';
      }
      this.store$.dispatch(new AuthActions.VerifyPhone(param));
    } else {
      let phoneNumber = this.phoneNumberInputForm.value.phoneNumber;
      phoneNumber = phoneNumber.replace(/[-]/g, '').replace(/\s+/g, '');
      if (phoneNumber.length === 10) {
        this.formControlService.validateAllFormFields(
          this.phoneNumberInputForm
        );
        
        this.notificationService$.error(NOTIFICATION_LIST.invalidPhoneNumber);
      }
    }
  }

  onVerifyOtp() {
    if (this.otpForm.valid) {
      const otpFormValue = this.otpForm.value;
      const requestObj = {
        otp: [
          otpFormValue.otp1,
          otpFormValue.otp2,
          otpFormValue.otp3,
          otpFormValue.otp4,
          otpFormValue.otp5,
        ].join(''),
        phone: this.phone,
        is_register: this.is_new_user,
      };
      this.store$.dispatch(new AuthActions.VerifyOtp(requestObj));
    } else {
      this.formControlService.validateAllFormFields(this.otpForm);
    }
  }

  onResendCode() {
    this.otpForm.setValue({
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
      otp5: '',
    });
    this.isResend = true;
    this.onVerifyPhone('resend');
    this.notificationService$.success('OTP sent on the phone number.');
  }

  onRegisterUser() {
    if (this.registerUserForm.valid) {
      this.hideNextButton = true;
      const requestObj = {
        first_name: this.registerUserForm.value.firstName,
        last_name:this.registerUserForm.value.lastName ,
        zipcode:this.registerUserForm.value.zipcode ,
        email_address: this.registerUserForm.value.email,
        otp_id: this.otpId,
        device_token: '',
      };
      this.store$.dispatch(new AuthActions.RegisterPhone(requestObj));
    } else {
      this.notificationService$.warning('Please enter email.');
      this.formControlService.validateAllFormFields(this.registerUserForm);
    }
  }

  onShowPhoneModal() {
    this.verifiedCaptha = false;
    this.disableNextButton = false;
    this.phoneNumberInputForm.setValue({
      phoneNumber: '',
    });
    this.phoneNumberInputModalRef = this.modalService.show(
      this.phoneNumberInputModal,
      {
        class: 'modal-dialog-centered auth-modal-dialog',
      }
    );
  }

  onShowOtpVerificationModal() {
    this.onDismissPhoneInputModal();
    this.otpForm.setValue({
      otp1: '',
      otp2: '',
      otp3: '',
      otp4: '',
      otp5: '',
    });
    
    this.otpVerificationModalRef = this.modalService.show(
      this.otpVerificationModal,
      {
        class: 'modal-dialog-centered auth-modal-dialog',
      }
    );
  }

  onShowNameModal() {
    this.registerUserForm.setValue({
      firstName: '',
      lastName:'',
      zipcode:'',
      email: '',
      
    });
    this.nameModalRef = this.modalService.show(this.nameModal, {
      class: 'modal-dialog-centered auth-modal-dialog',
    });
  }

  onShowEmailModal() {
    if (this.registerUserForm.value.zipcode.trim()) {
      this.onDismissZipcodeModal();
      this.emailModalRef = this.modalService.show(this.emailModal, {
        class: 'modal-dialog-centered auth-modal-dialog',
      });
    }
  }
  
  onShowLastNameModal() {
    if (this.registerUserForm.value.firstName.trim()) {
      this.onDismissNameModal();
      this.lastNameModalRef = this.modalService.show(this.lastNameModal, {
        class: 'modal-dialog-centered auth-modal-dialog',
      });
    }
  }
  
  onShowZipcodeModal() {
    if (this.registerUserForm.value.lastName.trim()) {
      this.onDismissLastnameModal();
      this.zipCodeModalRef = this.modalService.show(this.zipCodeModal, {
        class: 'modal-dialog-centered auth-modal-dialog',
      });
    }
  }

  onFirstNameKeyUp(event) {
    if (event.key === 'Enter') {
      this.onShowLastNameModal();
    }
  }

  onLastNameKeyUp(event) {
    if (event.key === 'Enter') {
      this.onShowZipcodeModal();
    }
  }

  onZipcodeKeyUp(event) {
    if (event.key === 'Enter') {
      this.onShowEmailModal();
    }
  }  

  onEmailKeyUp(event) {
    if (event.key === 'Enter') {
      this.onRegisterUser();
    }
  }

  onDismissPhoneInputModal() {
    if (this.phoneNumberInputModalRef) {
      this.phoneNumberInputModalRef.hide();
      this.verifiedCaptha = false;
    }
  }

  onDismissVerificationModal() {
    if (this.otpVerificationModalRef) {
      this.otpVerificationModalRef.hide();
    }
  }

  onDismissNameModal() {
    if (this.nameModalRef) {
      this.nameModalRef.hide();
    }
  }

  onDismissLastnameModal() {
    if (this.lastNameModalRef) this.lastNameModalRef.hide();
  }

  onDismissZipcodeModal() {
    if (this.zipCodeModalRef) this.zipCodeModalRef.hide();
  }

  onDismissEmailModal() {
    if (this.emailModalRef) {
      this.emailModalRef.hide();
    }
  }

  onReturnPhoneModal() {
    this.resetcouter();
    if (this.otpVerificationModalRef) {
      this.otpVerificationModalRef.hide();
    }
    this.onShowPhoneModal();
  }

  resetcouter(){
    this.counts = 0;
    this.isResend = false;
  }

  setPhoneInputFocused(state: boolean) {
    if(this.verifiedCaptha){
      setTimeout(() => {
        this.phoneInputFocused = state;
      });
    }
  }

  checkPhoneForm() {
    if(this.verifiedCaptha) {
      // this.onVerifyPhone();
    }
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
        element = prevElement;
        break;
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
          element = nextElement;
          isValidNumber = true;
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
      this.onVerifyOtp();
    }
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    let myFunc = num => Number(num);
    let otpArray = Array.from(String(pastedText), myFunc);
    if(otpArray.length == 5) {
      this.otpForm.setValue({
        otp1: otpArray[0],
        otp2: otpArray[1],
        otp3: otpArray[2],
        otp4: otpArray[3],
        otp5: otpArray[4],
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.verifiedCaptha = false;
  }

  resolved(captchaResponse: string) {
    if(captchaResponse){
      this.tokencaptcha = captchaResponse;
      this.verifiedCaptha = true;
    }
  }

  getWaitTime() {
    let blockTime = Math.pow(3, this.callCounter) * 10;
    this.countDown = this.secondsToDayhourMinSec(blockTime);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      blockTime -= 1;
      this.countDown = this.secondsToDayhourMinSec(blockTime);
      if(this.countDown == null || this.countDown == undefined || this.countDown == "") {
        this.enableResendButton = true;
        this._cdr.detectChanges();
        clearInterval(this.timer);
      }
    }, 1000);

    setTimeout(()=> {
      clearInterval(this.timer);
      this.callCounter = -1;
    }, 300000);
  }

  secondsToDayhourMinSec(seconds: number) {
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600*24));
    let h = Math.floor(seconds % (3600*24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    
    let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }
}
