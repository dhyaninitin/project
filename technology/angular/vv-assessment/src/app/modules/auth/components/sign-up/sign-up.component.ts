import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { ResultService } from 'src/app/modules/dashboard/services/result.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  userForm: FormGroup;
  collegeCode: any;
  collegeName: any;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.phoneNumberValidator()]],
      education: ['', Validators.required],
      year: ['', Validators.required],
      collegeCode: ['', Validators.required],
      collegeName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    localStorage.removeItem('token');
    localStorage.setItem('currentPage', 'signup');
    this.userForm.patchValue({
      collegeCode: localStorage.getItem('collegeCode'),
      collegeName: localStorage.getItem('collegeName'),
      year: localStorage.getItem('year')
    });
    this.userForm.get('collegeCode')?.disable();
    this.userForm.get('collegeName')?.disable();
    this.userForm.get('year')?.disable();
  }

  phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = /^\d{10}$/.test(control.value);
      return valid ? null : { 'invalidPhoneNumber': { value: control.value } };
    };
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.userForm.value.email = this.userForm.value.email.toLowerCase();
      this.userForm.value.collegeCode = localStorage.getItem("collegeCode");
      this.userForm.value.collegeName = localStorage.getItem("collegeName")
      this.userForm.value.year = localStorage.getItem('year')
      this.authService.signUp(this.userForm.value).subscribe((res: any) => {
        if (res.status === 200) {
          localStorage.setItem('token', res.token)
          this.router.navigateByUrl('/test/test-description');
        } else if (res.status == 201) {
          localStorage.setItem('token', res.token)
          this.router.navigateByUrl('/test/test-description');
        } else if (res.status == 400) {
          this.snackbar.open(res.message, "Cancel", { duration: 3000, });
        } else {
          this.snackbar.open(res.message, "Cancel", { duration: 3000, });
        }
      })
    } else {
      this.snackbar.open("Register Your Details Correctly", "Cancel", { duration: 3000, });
    }
  }

  courses = [
    "BCA",
    "B.Sc. IT ",
    "B.Tech. ",
    "MCA ",
    "M.Sc. IT ",
    "M.Tech. ",
    "PG Diploma in Computer Applications",
    "PG Diploma in Information Technology",
    "Diploma in Computer Science Engineering",
    "Diploma in Information Technology",
  ];

}