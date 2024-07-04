import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { CustomValidators } from 'ng2-validation';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import * as _ from 'underscore';

import { egretAnimations } from 'app/shared/animations/egret-animations';
import { Profile, UpdateProfile } from 'app/shared/models/user.model';
import { FormControlService } from 'app/shared/services/form-control.service';
import { AppState } from 'app/store/';
import * as actions from 'app/store/auth/authentication.action';
import {
  dataSelector,
  didFetchSelector,
  fetchingSelector,
} from 'app/store/auth/authentication.selector';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatPhoneNumber } from 'app/shared/helpers/utils';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfirmService } from 'app/shared/services/app-confirm/app-confirm.service';
import { PhonePipe } from 'app/shared/pipes/phone.pipe';
import { NgOtpInputComponent } from 'ng-otp-input';

@Component({
  selector: 'app-profile-overview-edit',
  templateUrl: './overview-edit.component.html',
  styleUrls: ['./overview-edit.component.scss'],
  animations: egretAnimations,
  providers: [ PhonePipe ]
})
export class ProfileOverviewEditComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  public didFetch$: Observable<any>;
  public fetching$: Observable<any>;
  public userProfile: Profile;

  public search = '';

  profileForm: FormGroup;

  inputType: Array<String> = ['password', 'password'];
  visible: Array<boolean> = [false, false];
  icon: boolean = true;
  isResetRequired: boolean = false;
  countryCode: string = '1';
  enable2FAuth:boolean = false
  showQrCode:boolean = false;
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  secretKey: string;
  @ViewChild('phoneInput') phoneInput: ElementRef;
  loadingQrCode: boolean = false;
  googleSecretkey: any;
  isValidOTP: boolean = false;
  isOTPSent: boolean = false;
  oneTImePassword: any;
  setupCompleted: boolean = false;
  otp: FormControl;
  @ViewChild(NgOtpInputComponent, { static: false}) ngOtpInput:NgOtpInputComponent;
  @ViewChild('ngOtpInput') ngOtpInputRef: any;
  isSelected: boolean = false;
  changeMethod: boolean = false;
  isVerifying: boolean = false;
  isSendingSMS: boolean = false;
  isDisabled:boolean = false;

  constructor(
    private store$: Store<AppState>,
    private formBuilder$: FormBuilder,
    private formControlService$: FormControlService,
    private changeDetectorRefs: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public defaults: any,
    private dialogRef: MatDialogRef<ProfileOverviewEditComponent>,
    private portalUserService$: PortalUserService,
    private snack$: MatSnackBar,
    private confirmService$:AppConfirmService,
    private phonePipe:PhonePipe
  ) {
    this.didFetch$ = this.store$.select(didFetchSelector);
    this.fetching$ = this.store$.select(fetchingSelector);
    this.otp = new FormControl('');
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  ngOnInit() {
    if(this.defaults) {
      const phoneInfo = formatPhoneNumber(this.defaults.toString());
      this.defaults = phoneInfo['nationalNumber'];
    }
    const password = new FormControl('', [Validators.minLength(8), Validators.pattern('(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%#*?&]).{8,}')]);
    const confirmPassword = new FormControl('', [
      CustomValidators.equalTo(password),
      Validators.minLength(8),
      Validators.pattern('(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%#*?&]).{8,}')
    ]);
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.profileForm = this.formBuilder$.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phone: [''],
      personalemail: [''],
      discord_url: ['', Validators.pattern(urlRegex)],
      facebook_url: ['', Validators.pattern(urlRegex)],
      linkedin_url: ['', Validators.pattern(urlRegex)],
      twitter_url: ['', Validators.pattern(urlRegex)],
      instagram_url: ['', Validators.pattern(urlRegex)],
      tiktok_url: ['', Validators.pattern(urlRegex)],
      password: password,
      confirmPassword: confirmPassword,
      two_factor_slider : [''],
      two_factor_option : [''],
    });

    this.didFetch$
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap(didFetch => !didFetch && this.loadData())
      )
      .subscribe();

    this.store$
      .select(dataSelector)
      .pipe(
        debounceTime(10),
        takeUntil(this.onDestroy$),
        tap((profile: Profile) => this.initData(profile))
      )
      .subscribe();
  }

  loadData() {
    this.store$.dispatch(new actions.GetUserInfo());
  }

  initData(profile: Profile) {
    this.userProfile = profile;
    let phoneNumber = null; 
    if(this.userProfile.phone != 0 && this.userProfile.phone != null) {
      phoneNumber = formatPhoneNumber(this.userProfile.phone.toString());
      this.countryCode = phoneNumber['countryCallingCode'];
      phoneNumber = phoneNumber['nationalNumber'];
    } 
    this.profileForm.patchValue({
      firstname: this.userProfile.first_name,
      lastname: this.userProfile.last_name,
      phone: phoneNumber,
      personalemail: this.userProfile.personalemail,
      discord_url: this.userProfile.discord_url,
      facebook_url: this.userProfile.facebook_url,
      instagram_url: this.userProfile.instagram_url,
      tiktok_url: this.userProfile.tiktok_url,
      linkedin_url: this.userProfile.linkedin_url,
      twitter_url: this.userProfile.twitter_url,
      two_factor_option:this.userProfile.two_factor_slider ? this.userProfile.two_factor_option : null,
      two_factor_slider:this.userProfile.two_factor_slider,
    });

    if(this.profileForm.controls['two_factor_option'].value == 1) {
      const otpAuthUrl = `otpauth://totp/CarBlip Portal ${this.userProfile?.email}?secret=${this.userProfile?.secretkey}`;
      this.showQrCode = true;
      this.secretKey = otpAuthUrl;
    }
    
    this.isResetRequired = this.userProfile.is_reset_password_required == 1 ? true : false;
    if(this.isResetRequired) {
      this.profileForm.get('password').addValidators([Validators.required]);
      this.profileForm.get('password').setErrors({'incorrect': true});
      this.profileForm.get('confirmPassword').addValidators([Validators.required]);
      this.profileForm.get('confirmPassword').setErrors({'incorrect': true});
      this.profileForm.markAllAsTouched();
    }
    if(this.userProfile?.two_factor_slider){
      this.enable2FAuth = true;
    }
    this.changeDetectorRefs.detectChanges();
  }

  getLocation() {
    let result = '';
    if (this.userProfile && this.userProfile.location) {
      let locations = this.userProfile.location;
      result =  locations.map((locations: any) => locations.name);
    }
    return result;
  }

  getRole() {
    let role = '';
    if (this.userProfile && this.userProfile.roles) {
      role = this.userProfile.roles[0].name;
    }
    return role;
  }

  /**
   * Submit updated profile info
   * @param {}
   */

  onSubmit() {
    if (!this.profileForm.valid) {
      this.formControlService$.validateAllFormFields(this.profileForm);
    } else {
      const phoneNumber = formatPhoneNumber(this.profileForm.value.phone);

      const payload: UpdateProfile = {
        first_name: this.profileForm.value.firstname,
        last_name: this.profileForm.value.lastname,
        phone: phoneNumber['number']
      };
      if(this.profileForm.value.discord_url) {
        payload['discord_url'] = this.profileForm.value.discord_url;
      }
      if(this.profileForm.value.facebook_url) {
        payload['facebook_url'] = this.profileForm.value.facebook_url;
      }
      if(this.profileForm.value.instagram_url) {
        payload['instagram_url'] = this.profileForm.value.instagram_url;
      }
      if(this.profileForm.value.linkedin_url) {
        payload['linkedin_url'] = this.profileForm.value.linkedin_url;
      }
      if(this.profileForm.value.twitter_url) {
        payload['twitter_url'] = this.profileForm.value.twitter_url;
      }
      if(this.profileForm.value.tiktok_url) {
        payload['tiktok_url'] = this.profileForm.value.tiktok_url;
      }
      if(this.profileForm.value.personalemail) {
        payload['personalemail'] = this.profileForm.value.personalemail;
      }

      if (this.profileForm.value.password) {
        payload['password'] = this.profileForm.value.password;
        payload['password_confirmation'] = this.profileForm.value.password;
        if(this.isResetRequired) {
          payload['is_reset_password_required'] = 0;
        }
      }
        payload['two_factor_slider'] = this.profileForm.value.two_factor_slider;
        payload['two_factor_option'] = this.profileForm.value.two_factor_option;
      if(this.profileForm.value.two_factor_slider && this.profileForm.value.two_factor_option >= 0){
        payload['is_verify'] = 1;
      } else {
        payload['is_verify'] = 0;
        payload['two_factor_token'] = null
      }       
      this.store$.dispatch(new actions.UpdateUserInfo(payload));
      this.dialogRef.close(true);
    }
  }

  toggleVisibility(index: number) {
    if (this.visible[index]) {
      this.inputType[index] = 'password';
      this.visible[index] = false;
      this.changeDetectorRefs.markForCheck();
    } else {
      this.inputType[index] = 'text';
      this.visible[index] = true;
      this.changeDetectorRefs.markForCheck();
    }
  }

  click() {
    this.icon = !this.icon;
  }

  valueChanges($event: any) {
    this.profileForm.get('password').markAsTouched();
  }

  show2fAoptions($event: any) {
    this.enable2FAuth = !this.enable2FAuth;
    if(this.profileForm.value.two_factor_slider && this.userProfile.two_factor_slider && this.userProfile.is_verify) {
      const method = this.profileForm.value.two_factor_option == 1 ? 0 : 1;
      this.onTwoFactorSelection($event, method);
    } else {
      this.profileForm.patchValue({two_factor_option: null});
      this.changeMethod = false;
      this.isVerifying = false;
      this.setupCompleted = false;
    }
    if(this.enable2FAuth) this.isDisabled = true;
  }

  onTwoFactorSelection(event: any, value: number) {
    this.setupCompleted = false;
    if(!this.userProfile.is_verify){
      if(this.enable2FAuth && !this.profileForm.value.phone && value == 0){
        event.preventDefault()
        this.profileForm.patchValue({two_factor_option: null});
        this.phoneInput.nativeElement.focus();
        this.snack$.open('Please Enter phone number first', 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      } else {
        this.onAuthSelection({value: value})
      }
      return;
    } else {
      event.preventDefault()
    }
    if(this.userProfile.is_verify && this.userProfile.two_factor_option == value) {
      this.changeMethod = false;
      this.profileForm.patchValue({ two_factor_option: value });
      return;
    }
    const phoneNumber = this.phonePipe.transform(this.profileForm.value.phone, 'US')
    let message = "";
    if (value == 1 && this.enable2FAuth) {
      message = `Are you sure you want to change the two factor authentication method?`
    } else if(value == 0 && this.enable2FAuth){
      message = `Are you sure you want to change the two factor authentication method?`
    } else if (value == 1 && !this.enable2FAuth) {
      message = `Are you sure you want to turn off the two factor authentication?`
    } else if(value == 0 && !this.enable2FAuth){
      message = `Are you sure you want to turn off the two factor authentication?`
    }
    const payload  = {
        message: message,
        okLabel:value == 1 ? 'Send SMS' : 'Yes',
        cancelLabel:'No'
    }
    this.confirmService$
      .confirm(payload)
      .subscribe(res => {
        if(!res) {
          event.preventDefault();
        }
        else {
          this.resetOtp()
          if(res && value == 1 && this.userProfile.is_verify){
            this.sendSms(true);
            this.changeMethod = true;
          } 
          if(res && value == 0 && this.userProfile.is_verify){
            this.onAuthSelection({value: value}, true);
            this.changeMethod = true;
          }
        }
      });
  }


  resetOtp(){
    this.changeDetectorRefs.detectChanges()
    setTimeout(() => {
      if(this.showQrCode || this.isOTPSent){
        this.ngOtpInputRef.setValue(null);
      }
    }, 0)
  }
  

  onAuthSelection(event:any , val?) {
    this.changeDetectorRefs.detectChanges()
    this.showQrCode = event.value == 1 ? true : false
    if(val) this.showQrCode = true;
    this.isOTPSent = false
    this.resetOtp()
    this.isSelected = true;
    if(this.showQrCode){
      if(!this.userProfile.secretkey && !this.userProfile.is_verify) {
        this.loadingQrCode = true;
        this.portalUserService$.twoFactorAuthenticate().subscribe((res) =>{
          if(res.data){
            const otpAuthUrl = `otpauth://totp/CarBlip Portal ${this.userProfile?.email}?secret=${res.data}`;
            this.secretKey = otpAuthUrl;
            this.googleSecretkey = res.data;
            this.loadingQrCode = false;
          }
        })
      } else {
        const otpAuthUrl = `otpauth://totp/CarBlip Portal ${this.userProfile?.email}?secret=${this.userProfile.secretkey}`;
        this.secretKey = otpAuthUrl;
        this.loadingQrCode = false;
      }
    }
  }

  trunOff: boolean = false;
  verifyOtp() {
    this.trunOff = false;
    let option = this.profileForm.value.two_factor_option;
    let  payload = {};
    this.isVerifying = true;
    if(option == 1){
      payload['secretKey'] = this.userProfile.secretkey ? this.userProfile.secretkey : this.googleSecretkey;
      payload['otp'] = this.oneTImePassword;
      payload['option'] = option;
    }else{
      payload['otp'] = this.oneTImePassword;
      payload['option'] = option;
      payload['secretKey'] =  null;
    }
    this.portalUserService$.verifyOTP(payload).subscribe((res) =>{
      if(res.success) {
        this.isDisabled = false;
        if(!this.enable2FAuth && this.userProfile.is_verify) {
          this.changeMethod = false;
          this.isVerifying = false;
          this.setupCompleted = false;
          this.profileForm.patchValue({ two_factor_option: null, two_factor_slider: 0})
          this.profileForm.markAsDirty();
          this.trunOff = true;
          // Turn Off 2FA
          // this.portalUserService$.turnOffTwoFA().subscribe(res=> {
          //   if(res.success) {
          //     this.profileForm.markAsDirty();
          //     this.trunOff = true;
          //     this.store$.dispatch(new actions.GetUserInfo());
          //     this.snack$.open(res.message, 'OK', {
          //       duration: 2000,
          //       verticalPosition: 'top',
          //       panelClass: ['snack-success'],
          //     });
          //   }
          // });
          
       
        } else {
          // if(this.changeMethod)
          // if(!this.userProfile.is_verify) {
          //   this.store$.dispatch(new actions.GetUserInfo());
          // }           
          setTimeout(() => {
            this.profileForm.markAsDirty();
            this.isVerifying = false;
            this.setupCompleted = true;
            this.trunOff = true;
            if(this.changeMethod && this.userProfile.is_verify && this.profileForm.value.two_factor_option != this.userProfile?.two_factor_option) {
              this.changeMethod = false;
            }
            if(this.changeMethod && this.userProfile.is_verify && this.userProfile?.two_factor_option == 0) {
              this.portalUserService$.twoFactorAuthenticate().subscribe((res) =>{
                if(res.data){
                  const otpAuthUrl = `otpauth://totp/CarBlip Portal ${this.userProfile?.email}?secret=${res.data}`;
                  this.secretKey = otpAuthUrl;
                  this.googleSecretkey = res.data;
                  this.loadingQrCode = false;
                }
              })
            }
            if(this.changeMethod && this.userProfile.is_verify) {
              const method = this.userProfile.two_factor_option ? 0 : 1; 
              this.profileForm.patchValue({ two_factor_option : method});
              this.setupCompleted = false;
            }
          }, 1200)   
          this.snack$.open(res.message, 'OK', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['snack-success'],
          }); 
        }
      } else {
        this.isVerifying = false;
        this.snack$.open(res.message, 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snack-warning'],
        });
      }
    });
    

  }

  onOtpChange(otp: any) {
    this.oneTImePassword = otp;
    this.isValidOTP = otp?.length == 6 ? true : false;
    
  }

  sendSms(val) {
    this.isSendingSMS = true;
    this.portalUserService$.sendSMSotp().subscribe((res) =>{
        if(res.success){
        this.profileForm.value.otp = null
        this.isOTPSent = true ;
        if(val) {
          this.showQrCode = false
          this.isSelected = true
        }
        this.isSendingSMS = false;
        this.snack$.open(res.message, 'OK', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
      }
    }); 
  }

  showMethod() {
    if(this.profileForm.value.two_factor_option == 0 && !this.userProfile?.is_verify) {
      return 2;
    } else if (this.userProfile.two_factor_option == 0 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.setupCompleted && this.changeMethod && this.userProfile.is_verify) {
      return 1;
    } else if(this.profileForm.value.two_factor_option == 1 && !this.userProfile.is_verify) {
      return 1;
    } else if (this.userProfile.two_factor_option == 1 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.setupCompleted && this.changeMethod && this.userProfile.is_verify) {
      return 2;
    }
  }

  isTwoFactorInProgress() {
    if(!this.userProfile.is_verify && this.profileForm.value.two_factor_slider == 1) {
      return true;
    } else if (this.userProfile.two_factor_option == 1 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.setupCompleted && this.changeMethod && this.userProfile.is_verify) {
      return true;
    } else if  (this.userProfile.two_factor_option == 0 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.setupCompleted && this.changeMethod && this.userProfile.is_verify) {
      return true;
    } else {
      return false;
    }
  }

  disableButton(){
    if(this.isDisabled){
      return true;
    } else if (this.userProfile.two_factor_option == 1 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.isDisabled && this.changeMethod && this.userProfile.is_verify) {
      return true;
    } else if  (this.userProfile.two_factor_option == 0 && this.profileForm.value.two_factor_option != this.userProfile.two_factor_option && !this.isDisabled && this.changeMethod && this.userProfile.is_verify) {
      return true;
    } else {
      return false;
    }
  }

  
}
