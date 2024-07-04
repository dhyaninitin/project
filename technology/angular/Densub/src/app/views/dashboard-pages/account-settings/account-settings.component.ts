import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { currentUser } from '../../../layouts/home-layout/user.model';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { AlertService } from '../../../shared-ui/alert/alert.service';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { UsersService } from '../../../shared-ui/service/users.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  constructor(
    private jwtService: JwtService,
    private alertService: AlertService,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private usersService: UsersService
  ) {
    /** Here we get logged user info from jwt service for the update account info*/
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.userDetails = Object.assign({}, this.currentUser);
    this.userDetails['newPassword'] = '';
    this.userDetails['confNewPassword'] = '';
  }
  currentUser: currentUser = new currentUser;
  userDetails: currentUser = new currentUser;
  public shouldShow = true;

  /** Here is define validation fields*/
  requiredValidate: any = {
    firstName: '',
    lastName: '',
    phone: '',
  };

  ngOnInit() {
    setTimeout(() => {
      this.globalService.topscroll();
    }, 200);
  }

  /**
   * Name: updateUser():
   * Description: This method will update account info .
   */
  updateUser() {

    this.alertService.clear();
    const objecKeys = Object.keys(this.requiredValidate);
    const self = this;
    const found = objecKeys.filter(function (obj) {
      return !self.userDetails[obj];
    });
    if (found.length) {
      this.alertService.error('*Please fill all mandatory fields!');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    this.alertService.clear();
    if (this.userDetails['newPassword'] !== '' && (this.userDetails['newPassword'] !== this.userDetails['confNewPassword'])) {
      this.alertService.error('Password & confirm password doesn\'t match!');
      return;
    } else if (this.userDetails['newPassword'] === '') {
      delete this.userDetails['newPassword'];
    } else {
      this.userDetails['password'] = this.userDetails['newPassword'];
    }
    delete this.userDetails['confNewPassword'];
    this.userDetails['createdBy'] = this.currentUser._id;
    this.usersService.doSignup(this.userDetails).subscribe((data) => {
      if (data.status === 200) {
        const userDetails = {
          _id: data.data._id,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          profilePhoto: data.data.profilePhoto,
          email: data.data.email,
          phone: data.data.phone,
          userType: data.data.userType,
          accessLevel: data.data.accessLevelId
        };
        this.jwtService.saveCurrentUser(JSON.stringify(userDetails));
        this.jwtService.getCurrentUser();
        setTimeout(() => {
          this.currentUser =  this.jwtService.currentLoggedUserInfo;
        }, 1000);
        this.toastr.success('Saved successfully.', 'Success');
      } else {
        this.alertService.error(data.message);
      }
    }, (error) => {
      this.toastr.error('There are some server Please check connection.', 'Error');
    });
  }

  AvoidSpace(event ?: any) {
    const k = event ? event.which : event.keyCode;
    if (k === 32) {
      return false;
    }

  }

}
