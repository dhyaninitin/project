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

@Injectable({
  providedIn: 'root'
})
export class AdminRouteGuard implements CanActivate, CanActivateChild {
  currentUser: currentUser = new currentUser();
  constructor(
    private jwtService: JwtService,
    private router: Router,
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if ( this.jwtService.getToken() && this.currentUser &&
         this.currentUser.userType !== environment.USER_TYPE.STAFF &&
         this.currentUser.userType !== environment.USER_TYPE.PRACTICE ) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
}
