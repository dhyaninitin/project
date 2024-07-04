import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { JwtService } from '../service/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private router: Router
  ){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(this.jwtService.getToken()){
      let user = JSON.parse(this.jwtService.getCurrentUser());
      if(user['userType'] == 'admin'){
        return true;
      } else{
        this.router.navigate(['/']);
      }
    }else{
      this.router.navigate(['/login']);
    }
  }
}
