import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AuthService } from 'app/shared/services/auth/auth.service';
import { LocalStorageService } from 'app/shared/services/local-storage.service';
import { AppState } from 'app/store';
import * as actions from 'app/store/auth/authentication.action';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { ConfigService } from '@vex/config/config.service';
import { ColorSchemeName } from '@vex/config/colorSchemeName';
import { Carblip_logo, colorVariables } from '@vex/components/config-panel/color-variables';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInUp400ms
  ]
})
export class SigninComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  signinForm: FormGroup;
  error: null;

  inputType = 'password';
  visible = false;
  showProgressBar: boolean = true;

  logoPath: string = '';
  showOtpInput: boolean = false;
  btnCaption: string = 'SIGN IN';
  twoFaAuthType: number;
  displayTime: string = null;
  timerOff: boolean = true;
  isValidOTP: boolean = true;
  oneTImePassword: any;

  constructor(
    private authService$: AuthService,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private router$: Router,
    private localStorageService: LocalStorageService,
    private cd: ChangeDetectorRef,
    private configService: ConfigService,
    private snack$: MatSnackBar
  ) {
    const nightMode = localStorage.getItem('portal-night-mode');
    if (nightMode == '1') {
      this.logoPath = Carblip_logo.logo_white;
      this.configService.updateConfig({
        style: {
          colorScheme: ColorSchemeName.dark,
          colors: {
            primary: {
              default: colorVariables.carblip_night.default,
              contrast: colorVariables.carblip_night.contrast
            }
          }
        }
      });
    } else {
      this.logoPath = Carblip_logo.logo_dark;
    }
  }

  ngOnInit() {
    if (this.authService$.isLoggedIn()) {
      this.router$.navigate(['/dashboard']);
    }
    this.signinForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false, Validators.required]
    });
  }

  signin() {
    const signinData = this.signinForm.value;
    this.showProgressBar = true;
    this.submitButton.disabled = true;
    this.error = null;
    this.progressBar.mode = 'indeterminate';
    if (this.showOtpInput) {
      this.verifyOtp()
    } else {
      this.authService$
        .login(signinData.email, signinData.password)
        .pipe(
          map(result => result),
          catchError(error => of(error))
        )
        .subscribe(res => {
          if (res.success) {
            this.progressBar.mode = 'determinate';
            this.twoFaAuthType = res.type
            this.showOtpInput = true;
            this.isValidOTP = false;
            if(this.twoFaAuthType == 0) {
              this.countTime();
            }
            this.btnCaption = 'VERIFY'
            this.cd.detectChanges();
          } else {
            this.setAuthorization(res)
          }

        });
    }
  }

  //@desc set token on localstorage
  setAuthorization(res) {
    this.progressBar.mode = 'determinate';
    if (res.token_type) {
      this.localStorageService.storeAuthorization(
        `${res.token_type} ${res.access_token}`
      );
      this.store.dispatch(new actions.LoginSuccessful(res));
      this.snack$.open('You are successfully logged in', 'OK', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: ['snack-success'],
      });
    } else {
      this.error = res.error.message;
      this.showProgressBar = false;
      this.submitButton.disabled = false;
      this.cd.detectChanges();
      this.snack$.open(this.error, 'OK', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['snack-warning'],
      });
    }
  }

  //@desc Verify OTP
  verifyOtp() {
    const payload = {
      email: this.signinForm.value.email,
      otp: this.oneTImePassword
    }
    this.authService$.verifyOtp(payload).pipe(
      map(result => result),
      catchError(error => of(error))
    ).subscribe((res) => {
      this.setAuthorization(res)
    })
  }

  resendOtp() {
    this.authService$
      .login(this.signinForm.value.email, this.signinForm.value.password)
      .subscribe()
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  //@desc show timer
  countTime() {
    let minute = 1
    let seconds: number = minute * 30;
    let textSec: any = "0";
    let statSec: number = 30;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) textSec = "0" + statSec;
      else textSec = statSec;

      this.displayTime = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
   
      if (seconds == 0) {
        this.timerOff = false;
        clearInterval(timer);
      }
      this.cd.detectChanges();
    }, 1000);
  }

  onOtpChange(otp: any) {
  this.oneTImePassword = otp;
   this.isValidOTP = otp.length == 6 ? true : false;
  }
}
