import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from '../../../shared-ui/alert/alert.service';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { UsersService } from '../../../shared-ui/service/users.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  loading: boolean;
  errorMessage: string;
  successMessage: string;
  userData: any = { email: '' };

  constructor(
    private alertService: AlertService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private globalService: GlobalService,
    private usersService: UsersService
  ) {
    this.globalService.topscroll();
  }

  ngOnInit() {
  }
  // tslint:disable-next-line: member-ordering
  emailLink: string = '';
  validEmail: boolean = true;
  isClicked : boolean = false;

  forgotPassword() {
    this.isClicked = true;
    if (!this.checkValidEmail()) {
      return false;
    }
    this.loading = true;
    this.emailLink = '';
    this.userData.email = this.userData.email.toLocaleLowerCase();
    this.usersService.forgotPassword(this.userData).subscribe(
      data => {
        if (data.status === 200) {
          this.emailLink = data.emailLink;
          this.toastr.success(
            'Please check your email, reset password link has been sent.',
            'Success'
          );
          this.errorMessage = '';
          this.successMessage = data.message;
          this.userData = {
            email: ''
          };
          this.loading = false;
        } else {
          this.toastr.error(data.message, 'Error');
          this.successMessage = '';
          this.errorMessage = data.message;
          this.userData = {
            email: ''
          };
          this.loading = false;
        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  checkValidEmail() {
    if (this.isClicked) {
      this.validEmail = this.globalService.ValidateEmail(this.userData.email);
      return this.validEmail;
    }
  }
}
