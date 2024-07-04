import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  userId: any;
  templateName: String = '';
  hideSpinner: boolean = false;

  constructor(
    private spinnerSer: NgxSpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private _empSer: EmployeeService,
    private _authSer: AuthService
  ) 
  {
    this._empSer.hideSpinnerSubject.subscribe((x) => {
      if (x) {
        this.hideSpinner = x[0];
        this.templateName = x[1];
      }
      this.getUserId();
    });
  }

  getUserId() {
    if (this._authSer.userId) {
      this.userId = this._authSer.userId;
    } else {
      this._authSer.tokenDecoder(null);
      this.userId = this._authSer.userId;
    }
  }

  intercept(
    request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.spinnerSer.show(undefined, {
      type: 'ball-spin',
      size: 'medium',
    });

    if (
      request.urlWithParams === `http://localhost:5000/api/employee/checkTemplateNameExist/${this.userId}/${this.templateName}` && this.hideSpinner) {
      this.spinnerSer.hide();
    } else if (
      request.urlWithParams === `http://localhost:5000/api/employee/checkGlobalTemplateNameExist/${this.userId}/${this.templateName}` && this.hideSpinner) {
      this.spinnerSer.hide();
    }

    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(request).pipe(
      tap((event: any) => {
        if (event.body == undefined) {
          return next.handle(request);
        } else if (event.body.status == 401) {
          this.dialog.closeAll();
          localStorage.clear();
          localStorage.setItem('reload', 'true');
          this.router.navigateByUrl('/auth/login');
        }
        this.spinnerSer.hide();
        return next.handle(request);
      })
    );
  }
}
