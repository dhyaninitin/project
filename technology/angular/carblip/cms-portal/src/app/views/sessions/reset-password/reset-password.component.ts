import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/services/auth/auth.service';
import { CustomValidators } from 'ng2-validation';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { Carblip_logo } from '@vex/components/config-panel/color-variables';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  animations: [fadeInUp400ms]
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  resetPasswordForm: FormGroup;
  error;
  resetData={
    email: "",
    password: "",
    password_confirmation: "",
    token: ""
  }
  showProgressBar: boolean = true;
  logoPath: string = '';

  constructor(private authService$: AuthService,private snack$: MatSnackBar,
    private fb: FormBuilder,private router:Router,
    private route: ActivatedRoute,
    private _cdr: ChangeDetectorRef) {
      this.route.params.subscribe(params => {
        this.resetData.token = params.token;
      });
      this.route.queryParams.subscribe(params=>{
        this.resetData.email = params['email'];
      })

      const nightMode = localStorage.getItem('portal-night-mode');
      if(nightMode == '1') {
        this.logoPath = Carblip_logo.logo_white;
      } else {
        this.logoPath = Carblip_logo.logo_dark;
      }
    }

  ngOnInit() {
    const password = new FormControl('', [Validators.required,Validators.minLength(6),]);
    const confirmPassword = new FormControl(
      '',
      CustomValidators.equalTo(password)
    );

    const formFields = {
			password: password,
			confirmPassword: confirmPassword,
		};
		this.resetPasswordForm = this.fb.group(formFields);
  }

  resetPassword() { 
    this.resetData.password= this.resetPasswordForm.get('password').value;
    this.resetData.password_confirmation= this.resetPasswordForm.get('confirmPassword').value;
    this.submitButton.disabled = true;
    this.showProgressBar = true;
    this.progressBar.mode = 'indeterminate';
    this.authService$
      .resetPassword(this.resetData)
    .subscribe(res => {
      this.progressBar.mode = 'determinate';
      if (res) {
        this.submitButton.disabled = false;
        this.router.navigate(['/sessions/signin']);
      } else {
        this.error = res.error.message;
        this.submitButton.disabled = false;
        this.showProgressBar = false;
        this._cdr.detectChanges();
      }
    });
  }
}
