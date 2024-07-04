import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../shared-ui/service/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../shared-ui/service/global.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent implements OnInit {
  userData = {
    password: '',
    confirmPassword: ''
  };
  successMessage: string;
  errorResponseMessage: string;
  recoverData: any;
  errorMessage = 'New password does not match with Confirm password';
  userInfo: any = {};
  userId: any;
  link: any;
  expiredLinkErrorMsg:  String = '';

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private router: Router,
    private globalService: GlobalService,
    private route: ActivatedRoute) {
    this.globalService.topscroll();
    this.route.params.subscribe(res => {
      this.userId = res.userId;
      this.link = res.token;
    });
  }

  ngOnInit() {
    if(this.userId && this.link) {
      this.getUsersData();
    }
  }

  getUsersData() {
    this.expiredLinkErrorMsg = '';
    this.spinner.show();
    this.usersService.getUserInfo({_id: this.userId, link: this.link}).subscribe(
      data => {
        console.log('data===========', data);
        if (data.status === 200) {
          this.userInfo = data.data;
          if (!this.userInfo.forgotLink) {
            // this.expiredLinkErrorMsg = 'Forgot Password Link has been expired. Please check link or again you can request for forgot password!';
            this.expiredLinkErrorMsg = 'Your reset password link has expired. Please click here to request a new reset password link.';
          }
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.expiredLinkErrorMsg = 'Your reset password link has expired. Please click here to request a new reset password link.';
           // this.expiredLinkErrorMsg = 'Forgot Password Link has been expired. Please check link or again you can request for forgot password!';
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }
  recoverPassword() {
    const userNewInfo = {
      _id: this.userId,
      forgotLink: '',
      forgotStatus: 0,
      password: this.userData.password
    };
    this.spinner.show();
    this.usersService.doSignup(userNewInfo).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          this.toastr.success('Your password has been changed successfully. Please login to continue.', 'Success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }
  AvoidSpace(event?: any) {
    const k = event ? event.which : event.keyCode;
    if (k === 32) { return false; }
  }
}
