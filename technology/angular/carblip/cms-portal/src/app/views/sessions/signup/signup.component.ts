import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { Carblip_logo } from '@vex/components/config-panel/color-variables';
import { CustomValidators } from 'ng2-validation';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  animations: [fadeInUp400ms]
})
export class SignupComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  @ViewChild(MatButton) submitButton: MatButton;

  signupForm: FormGroup;

  inputType: Array<String> = ['password', 'password'];
  visible: Array<boolean> = [false, false];

  logoPath: string = '';

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {
    const nightMode = localStorage.getItem('portal-night-mode');
      if(nightMode == '1') {
        this.logoPath = Carblip_logo.logo_white;
      } else {
        this.logoPath = Carblip_logo.logo_dark;
      }
  }

  ngOnInit() {
    const password = new FormControl('', Validators.required);
    const confirmPassword = new FormControl(
      '',
      CustomValidators.equalTo(password)
    );

    this.signupForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: password,
      confirmPassword: confirmPassword,
      agreed: new FormControl('', (control: FormControl) => {
        const agreed = control.value;
        if (!agreed) {
          return { agreed: true };
        }
        return null;
      }),
    });
  }

  signup() {
    const signupData = this.signupForm.value;

    this.submitButton.disabled = true;
    this.progressBar.mode = 'indeterminate';
  }

  toggleVisibility(index: number) {
    if (this.visible[index]) {
      this.inputType[index] = 'password';
      this.visible[index] = false;
      this.cd.markForCheck();
    } else {
      this.inputType[index] = 'text';
      this.visible[index] = true;
      this.cd.markForCheck();
    }
  }
}
