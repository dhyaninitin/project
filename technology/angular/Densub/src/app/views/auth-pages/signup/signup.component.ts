import { Component, OnInit, ViewChild } from '@angular/core';
import { Register } from './signup.model';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { UsersService } from '../../../shared-ui/service/users.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../shared-ui/alert/alert.service';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment.prod';
import { FirebaseService } from './../../../shared-ui/service/firebase.service';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  AuthService
} from 'angular-6-social-login';
import { PositionTypeService } from '../../../shared-ui/service/positionType.service';
import { PositionType } from '../../../shared-ui/modal/positionType.modal';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  constructor(
    private usersService: UsersService,
    private toastr: ToastrService,
    private router: Router,
    private jwtService: JwtService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public OAuth: AuthService,
    private firebaseService: FirebaseService,
    private positionTypeService: PositionTypeService,
  ) {
    this.globalService.topscroll();
    this.route.params.subscribe(res => {
      // if (!res.type) {
      //   this.router.navigate(["/login"]);
      //   return;
      // }
      this.register.userType = (res.type !== undefined) ? res.type : 'practice';
      // setTimeout(() => {
      //   this.PositionTypeData = this.globalService.positionTypeData;
      // }, 500);
    });
  }
  register: Register = new Register();
  positionTypeList: PositionType[] = [];
  siteKey: any = '';
  alreadyEmailValidation: Boolean = false;
  validEmail: Boolean = true;
  validPositionType: Boolean = true;
  socialProvider: String = '';
  userTypes: any = environment.USER_TYPE;
  loginInfo: any = {
    email: '',
    password: '',
    userType: '',
    socialProvider: ''
  };
  userType: String = 'practice';
  positionType: String = '';
  emailLink: String = '';
  userDetails: FormGroup;
  @ViewChild('createSocialLoginModal', { static: false })
  public createSocialLoginModal: ModalDirective;
  /** Here is define seller signup validation fields */
  requiredValidate: any = {
    email: '',
    password: '',
    termsConditions: ''
  };
  public aFormGroup: FormGroup;

  /** This method will call for validate google recaptch successfully */
  IamAHuman: Boolean = true;
  showResendVerificationLink = false;
  userId = '';
  ngOnInit() {
    /** Here we are getting sitekey for the google recaptcha and do validate*/
    this.siteKey = this.globalService.siteKey;
    this.aFormGroup = this.formBuilder.group({
      recaptcha: ['', Validators.required]
    });
    this.getPositionTypeList();
  }
  handleSuccess(e) {
    console.log('google recaptcha handleSuccess', e);
    this.IamAHuman = true;
  }

  doSignup() {
    if (this.alreadyEmailValidation || !this.validEmail) {
      return false;
    }
    const objecKeys = Object.keys(this.requiredValidate);
    if (this.register.userType === this.userTypes.STAFF) {
       objecKeys.push('positionType');
    } else {
      if ( this.register.positionType){
        delete this.register['positionType'];
      }
    }
    const self = this;
    const found = objecKeys.filter(function(obj) {
        return !self.register[obj];
    });
    if (
      this.register.password !== this.register.confPassword ||
      found.length ||
      !self.IamAHuman
    ) {
      this.alertService.error('*Please fill all mandatory fields!');
      setTimeout(() => {
        this.alertService.clear();
      }, 5000);
      return false;
    }
    this.spinner.show();
    this.usersService.doSignup(this.register).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          delete data.data.password;
          this.userId =  data.data._id;
          this.insertUsersForChat(data.data._id, data.data);
          this.toastr.success('Please verify your email by using the verification link sent to your email address that you have registered with.','Almost Done!',{timeOut:600000});
          this.router.navigate(['/login']);
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



  insertUsersForChat(key, postData: any) {
    this.firebaseService.CreateUser(key, postData);
  }

  checkEmailAlreadyExists(email?: string) {
    this.validEmail = this.globalService.ValidateEmail(email);
    if (this.validEmail) {
      this.alreadyEmailValidation = false;
      const postData = { email: email };
      console.log(email);
      this.usersService.emailAlreadyExits(postData).subscribe(
        data => {
          if (data.status === 200 && data.data.length) {
            this.alreadyEmailValidation = true;
          } else {
            this.alreadyEmailValidation = false;
          }
        },
        error => {
          this.alreadyEmailValidation = false;
        }
      );
    } else {
      this.alreadyEmailValidation = false;
      return this.validEmail;
    }
  }
  /*------- Used For Social Login -------- */
  doSignin(socialusers?: any) {
    this.spinner.show();
    this.emailLink = '';
    this.alertService.clear();
    let postData = {};
    if (socialusers) {
      //delete unwanted variables
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
          if (loggedUser.userType === environment.USER_TYPE.ADMIN) {
            loggedUser.status = 1;
          } else {
            if (!loggedUser.emailVerificationStatus) {
              this.emailLink = data.emailLink;
              this.toastr.warning(
                'You will have to complete your email Verification. please check your email.',
                'Warning'
              );
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
              userType: loggedUser.userType,
              accessLevel: loggedUser.accessLevelId
            };
            this.jwtService.saveCurrentUser(JSON.stringify(userDetails));
            this.jwtService.getCurrentUser();
            if (
              loggedUser.userType !== environment.USER_TYPE.PRACTICE &&
              loggedUser.userType !== environment.USER_TYPE.STAFF
            ) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/' + loggedUser.userType + '/dashboard']);
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

  public socialSignIn() {
    let socialPlatformProvider;
    if (this.socialProvider === 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (this.socialProvider === 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
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

  AvoidSpace(event?: any) {
    const k = event ? event.which : event.keyCode;
    if (k === 32) {
      return false;
    }
  }

  isShow = false;

  toggleDisplay() {
    this.isShow = !this.isShow;
  }

  getPositionTypeList() {
    this.positionTypeService.getPositionType({}).subscribe(
      data => {
        if (data.status === 200) {
          this.positionTypeList = data.data;
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }
}
