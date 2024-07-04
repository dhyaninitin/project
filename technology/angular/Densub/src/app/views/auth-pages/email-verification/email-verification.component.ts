import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../shared-ui/service/users.service';
import {ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../../shared-ui/service/global.service';
@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  userInfo: any = {};
  userId: String = '';
  token: String = '';
  emailVerificationSccessMsg = false;
  emailVerificationErrorMsg = false;
  emailVerificationInvalidMsg = false;
  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private globalService: GlobalService,
    private route: ActivatedRoute) {
    this.globalService.topscroll();
    this.route.params.subscribe(res => {
      this.userId = res.userId;
      this.token = res.token;
    });
  }

  ngOnInit() {
    if (this.userId && this.token) {
      this.getUsersData();
    }
  }

  getUsersData() {
    this.spinner.show();
    this.usersService.getUserInfo({_id: this.userId, token: this.token}).subscribe(
      data => {
        if (data.status === 200) {
          this.userInfo = data.data;
          if (this.userInfo.emailVerificationStatus) {
            this.spinner.hide();
            this.emailVerificationErrorMsg = true;
          } else {
            this.emailVerificationSccessMsg = true;
            this.updateData();
          }
        } else {
          this.spinner.hide();
          this.emailVerificationInvalidMsg = true;
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

  updateData() {
    const postData = {
      _id: this.userInfo._id,
      emailVerificationStatus: 1,
      emailVerificationLink: ''
    };
    this.usersService.doSignup(postData).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
         this.toastr.success('Email has been verified successfully.', 'Success');
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

}
