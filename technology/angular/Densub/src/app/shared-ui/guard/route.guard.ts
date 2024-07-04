import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild
} from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtService } from '../service/jwt.service';
import { currentUser } from '../../layouts/home-layout/user.model';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../service/users.service';

@Injectable({
  providedIn: 'root'
})
export class RouteGuard implements CanActivate, CanActivateChild {
  currentUser: currentUser = new currentUser();
  constructor(
    private jwtService: JwtService,
    private router: Router,
    private toastr: ToastrService,
    private usersService: UsersService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if (this.jwtService.getToken()) {
      if (
          (
            ( this.currentUser['userType'] === environment.USER_TYPE.STAFF ||
              this.currentUser['userType'] === environment.USER_TYPE.PRACTICE) &&
              this.currentUser['profileVerificationStatus'] ===
              environment.PROFILE_STATUS.VERIFIED ) ||
              (this.currentUser['userType'] === environment.USER_TYPE.ADMIN)
        ) {
        //-- Check Profile Status
        //  this.router.navigate(['/']);
        return true;
      } else {
        //-- Check Profile Status when user is login and admin verified the profile
        this.usersService.getUserInfo({ _id: this.jwtService.currentLoggedUserInfo._id }).subscribe(
          data => {
            if (data.status === 200) {
              const userData = data.data;
               if (userData.profileVerificationStatus === environment.PROFILE_STATUS.VERIFIED) {
                //------ Verified Profile
                const userDetails = {
                  _id: userData._id,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  email: userData.email,
                  phone: userData.phone,
                  profilePhoto: data.data.profilePhoto,
                  userType: userData.userType,
                  accessLevel: userData.accessLevelId,
                  location: userData.location,
                  address: userData.address,
                  profileVerificationStatus: userData.profileVerificationStatus,
                };
                this.jwtService.saveCurrentUser(JSON.stringify(userDetails));
                this.jwtService.getCurrentUser();
                return true;
              } else {
                  //------ Unverified Profile
                  this.toastr.clear();
                  let message = '';
                  if (userData.profileVerificationStatus === environment.PROFILE_STATUS.NEW) {
                    message = 'Please complete your profile first.';
                  } else if (userData.profileVerificationStatus === environment.PROFILE_STATUS.PENDING) {
                    message = 'Please wait for your profile to get approved by admin.';
                  }
                  this.toastr.success(message);
                  console.log(
                    'I am here else',
                    this.currentUser,
                    this.currentUser['profileVerificationStatus']
                  );
                  this.router.navigate([this.currentUser['userType'] + '/profile']);
                  return false;
              }
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
    } else {
      this.router.navigate(['/login']);
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
