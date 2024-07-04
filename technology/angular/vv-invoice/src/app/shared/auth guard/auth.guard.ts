import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private route: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token !== null || '') {
      return true;
    } else {
      this.route.navigateByUrl('/auth/login');
      return false;
    }
  }
}
