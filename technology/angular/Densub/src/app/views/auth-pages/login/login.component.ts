import { Component, OnInit, ViewChild , ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AlertService } from '../../../shared-ui/alert/alert.service';
import { environment } from '../../../../environments/environment.prod';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { UsersService } from '../../../shared-ui/service/users.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  AuthService
} from 'angular-6-social-login';


@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  constructor(
    private usersService: UsersService,
    private toastr: ToastrService,
    private router: Router,
    private jwtService: JwtService,
    private alertService: AlertService,
    private spinner: NgxSpinnerService,
    private globalService: GlobalService,
    public OAuth: AuthService,
  ) {
    this.globalService.topscroll();
    setTimeout(() => {
      this.PositionTypeData = this.globalService.positionTypeData;
    }, 500);
  }

  PositionTypeData: any = [];
  loginInfo: any = {
    email: '',
    password: '',
    userType: '',
    socialProvider: ''
  };
  userType: String = 'practice';
  socialProvider: String = '';
  @ViewChild('createSocialLoginModal', { static: false })
  public createSocialLoginModal: ModalDirective;
  emailLink: String = '';
  userDetails: FormGroup;
  inputFields = { username: '', email: '', password: '' };
  positionType: String = '';
  userTypes: any = environment.USER_TYPE;
  isShow = false;
  showResendVerificationLink = false;
  userId = '';

  ngOnInit() {}

  createForms() {}

  doSignin(socialusers?: any) {
    this.spinner.show();
    this.emailLink = '';
    this.alertService.clear();
    let postData = {};
    if (socialusers) {
      //delete unwanted variables
       if (socialusers.token || socialusers.idToken || socialusers.id) {
         delete socialusers.token;
         delete socialusers.idToken;
        }
       postData = socialusers;
    } else {
       postData = this.loginInfo;
    }
    this.usersService.doSignin(postData).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          const loggedUser = data.data;
          if (loggedUser.userType !== environment.USER_TYPE.PRACTICE &&
            loggedUser.userType !== environment.USER_TYPE.STAFF ) {
            loggedUser.status = 1;
          } else {
            if (!loggedUser.emailVerificationStatus) {
              this.showResendVerificationLink = true;
              this.userId = loggedUser._id;
              // this.emailLink = data.emailLink;
              this.toastr.warning(
                'In order to log in to your profile you must first complete the sign up process by verifying your email address. An email verification link was sent to the email address entered at the time of sign up. If you did not receive an email confirmation from Densub please sign up again and ensure that you enter the correct email address.',
                'Alert' ,{timeOut:600000});
              /* this.toastr.warning(
                'You will have to complete your email Verification. please check your email.',
                'Warning'
              ); */
              return;
            }
          }
          if (loggedUser.status === 1) {
            this.jwtService.saveToken(data.token);
            const userDetails = {
              _id: loggedUser._id,
              firstName: loggedUser.firstName,
              lastName: loggedUser.lastName,
              email: loggedUser.email,
              phone: loggedUser.phone,
              profilePhoto: data.data.profilePhoto,
              userType: loggedUser.userType,
              accessLevel: loggedUser.accessLevelId,
              location: data.data.location,
              address: data.data.address,
              profileVerificationStatus: data.data.profileVerificationStatus,
            };
            console.log(userDetails);
            this.jwtService.saveCurrentUser(JSON.stringify(userDetails));
            this.jwtService.getCurrentUser();
            if (
              loggedUser.userType !== environment.USER_TYPE.PRACTICE &&
              loggedUser.userType !== environment.USER_TYPE.STAFF
            ) {
              this.router.navigate(['/dashboard']);
            } else {
              if ( loggedUser.profileVerificationStatus === environment.PROFILE_STATUS.NEW ) {
                this.router.navigate(['/' + loggedUser.userType + '/profile']);
              } else {
                if(GlobalService.loginRedirectURL){
                  this.router.navigate(['/' + GlobalService.loginRedirectURL]);
                }else{
                  this.router.navigate(['/' + loggedUser.userType + '/dashboard']);
                }
              }
            }
          } else {
            this.toastr.error(
              'Your account has been deactivated by Admin.',
              'Error'
            );
          }
        } else {
          this.alertService.error(data.message);
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    );
  }

  resendVerificationMail() {
    if (!this.userId) {
      return false;
    }
    this.spinner.show();
    this.alertService.clear();
    this.usersService.resendVerificationEmail({ _id: this.userId}).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          if (data.sendEmail) {
            this.showResendVerificationLink = false;
            this.toastr.success(
              'Verification link has been successfully resent on your registered email id.',
              'Success' ,{timeOut:6000});
          } else {
            this.globalService.error();
          }
          this.spinner.hide();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  /*------- Used For Social Login -------- */
  public socialSignIn() {
    let socialPlatformProvider;
    if (this.socialProvider === 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (this.socialProvider === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    console.log(socialPlatformProvider, '-----------------');
    this.OAuth.signIn(socialPlatformProvider).then(socialusers => {
      socialusers['userType'] = this.userType;
      if (this.userType === this.userTypes.STAFF) {
        socialusers['positionType'] = this.positionType;
      }
      this.doSignin(socialusers);
    });
  }

  showNewJobModal(socialProvider: string) {
    this.socialProvider = socialProvider;
    this.createSocialLoginModal.show();
  }

  closeModel() {
    this.createSocialLoginModal.hide();
  }

  socialSignUp() {
    this.createSocialLoginModal.hide();
    this.socialSignIn();
  }

  logout() {
    this.OAuth.signOut().then(data => {
      console.log('data============', data);
    });
  }

  toggleDisplay() {
    this.isShow = !this.isShow;
  }
}
