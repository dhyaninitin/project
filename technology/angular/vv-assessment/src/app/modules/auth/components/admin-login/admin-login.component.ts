import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  adminForm: FormGroup;
  hide: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private router: Router,
    private commonService: CommonService
  ) {
    this.adminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.commonService.logout();
  }

  onSubmit() {
    if (this.adminForm.valid) {
      this.authService.adminLogin(this.adminForm.value).subscribe((res: any) => {
        if (res.status === 200) {
          localStorage.setItem('token', res.token)
          this.router.navigateByUrl('/dashboard');
        } else {
          this.snackbar.open(res.message, "Cancel", { duration: 3000, });
        }
      })
    } else {
      this.snackbar.open("Form is invalid", "Cancel", { duration: 3000, });
    }
  }
}
