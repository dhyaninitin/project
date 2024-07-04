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
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  hide!: boolean;

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
    this.signupForm = this.fb.group({
      name: [
        '',
        [
          Validators.compose([
            Validators.required,
          ]),
        ],
      ],
      mobileno: [
        '',
        [
          Validators.compose([
            Validators.required,
            Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")
          ]),
        ],
      ],
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

  get name(): AbstractControl {
    return this.signupForm.get('name') as FormControl;
  }
  get mobileno(): AbstractControl {
    return this.signupForm.get('mobileno') as FormControl;
  }
  get email(): AbstractControl {
    return this.signupForm.get('email') as FormControl;
  }
  get password(): AbstractControl {
    return this.signupForm.get('password') as FormControl;
  }

  signup() {
    let data = this.signupForm.value;
    this._authSer.signup(data).subscribe((res: any) => {
      if (res.status == 200) {
        this.router.navigateByUrl('/auth/login');
        this.snackBar.open(res.message, 'Cancel', {
          duration: 3000,
          panelClass: 'success-snackbar'
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
