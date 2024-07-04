import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private jwt:CommonService,
    private commonService$: CommonService
    ) {}
  
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return true;
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (
        localStorage.getItem('token') == '' ||
        localStorage.getItem('token') == null ||
        this.jwt.checkTokenExpirationDate(localStorage.getItem('token')) === false
      ) {
        this.router.navigateByUrl('/session-expired');
        return false;
      } else {
      return true
      }
  }
  
}
