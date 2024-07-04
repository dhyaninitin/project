import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar} from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatButton } from '@angular/material/button';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { Carblip_logo } from '@vex/components/config-panel/color-variables';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  animations: [fadeInUp400ms]
})
export class ForgotPasswordComponent implements OnInit {
  userEmail;
  error='';
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;
  showProgressBar: boolean = true;
  logoPath: string = '';
  constructor(private authService$: AuthService,private snack$: MatSnackBar, private fb: FormBuilder, private _cdr: ChangeDetectorRef) {
    const nightMode = localStorage.getItem('portal-night-mode');
    if(nightMode == '1') {
      this.logoPath = Carblip_logo.logo_white;
    } else {
      this.logoPath = Carblip_logo.logo_dark;
    }
  }
  
  form = this.fb.group({
    email: [null, Validators.required]
  });
  
  ngOnInit() {}
  submitEmail() {
    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
    this.showProgressBar = true;
    this.authService$
    .forgotPassword(this.userEmail)
    .subscribe(res => {
      this.progressBar.mode = 'determinate';
      if (res) {
        this.submitButton.disabled = false;
        this.snack$.open('Please check your email to reset password', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['snack-success'],
        });
      } else {
        this.error = res.error.message
        this.submitButton.disabled = false;
        this.showProgressBar = false;
        this._cdr.detectChanges();
      }
    });
  }

  send() {
    // this.router.navigate(['/']);
  }
}
