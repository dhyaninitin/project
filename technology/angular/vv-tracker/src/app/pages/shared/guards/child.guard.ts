import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class ChildGuard implements CanActivate {
  role: any;
  constructor(private _authSer: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const userRole = this.getAdminDetails();

    if (userRole === 2) {
      this.router.navigateByUrl('/users');
      return false;
    }

    return true;
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    return this.role;
  }

}

