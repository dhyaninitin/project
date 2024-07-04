import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm!: FormGroup;
  hide!: boolean;
  showOtpField: boolean = false;
  showPasswordField: boolean = false;
  showResendOtpLink: boolean = false;
  showSendEmailIcon: boolean = true;

  constructor(
    private _authSer: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.forgetPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.compose([
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
          ]),
        ],
      ],
      password: [
        '',
        [Validators.compose([Validators.required, Validators.minLength(8)])],
      ],
    });
    this.hide = true;
  }

  get email(): AbstractControl {
    return this.forgetPasswordForm.get('email') as FormControl;
  }
  get password(): AbstractControl {
    return this.forgetPasswordForm.get('password') as FormControl;
  }

  sendOtpToUserEmail() {
    let email = this.forgetPasswordForm.value.email;
    this._authSer.sendOtpToUserEmail(email).subscribe((res: any) => {
      if(res.status == 200) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.showOtpField = true;
        this.showSendEmailIcon = false;
      }
    })
  }

  resendOtpToUserEmail() {
    let email = this.forgetPasswordForm.value.email;
    this._authSer.sendOtpToUserEmail(email).subscribe((res: any) => {
      if(res.status == 200) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.showResendOtpLink = false;
      }
    })
  }

  onOtpChange(event: any) {
    if(event.length == 6) {
      const payload = {
        otp: event,
        email: this.forgetPasswordForm.value.email
      }
      this._authSer.checkOtp(payload).subscribe((res: any) => {
        if(res.status == 200) {
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          this.showOtpField = false;
          this.showPasswordField = true;
        }else if (res.status == 409) {
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.showPasswordField = false;
        }
        else{
          this.snackBar.open(res.message, 'Cancel', {
            duration: 3000,
            panelClass: 'error-snackbar'
          });
          this.showPasswordField = false;
          this.showResendOtpLink = true;
        }
      })
    }    
  }

  submit() {
    let data = this.forgetPasswordForm.value;
    this._authSer.forgetPassword(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.router.navigateByUrl('/auth/login');
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      } else if (res.status == 510) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      } else if (res.status == 400) {
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

}
