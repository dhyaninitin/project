import { Injectable, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})

export class CheckRouteGuard implements CanActivate, OnInit {
  constructor(private router: Router, private authService: AuthService, private commonService: CommonService) { }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const sessionId = next.params['sessionId'];
    return this.authService.compareSession(sessionId).pipe(
      map((res: any) => {
        if (res.status === 200) {
          localStorage.setItem('collegeCode', res.data.collegeCode);
          localStorage.setItem('collegeName', res.data.collegeName);
          localStorage.setItem('year', res.data.year);
          return true;
        } else {
          this.router.navigate(['session-expired']);
          this.commonService.logout();
          return false;
        }
      })
    );
  }
}
