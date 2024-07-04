import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import * as AuthActions from 'app/shared/states/auth/auth.actions';
import * as BrandActions from 'app/shared/states/brands/brands.actions';
import * as ConfigurationActions from 'app/shared/states/configuration/configuration.actions';
import * as CreditActions from 'app/shared/states/credit-application/credit-application.actions';
import * as LeaseActions from 'app/shared/states/lease/lease.actions';
import * as ModelActions from 'app/shared/states/models/models.actions';
import * as MyRequestActions from 'app/shared/states/my-request/myrequests.actions';
import * as TrimActions from 'app/shared/states/trim/trim.actions';
import * as UiActions from 'app/shared/states/ui/ui.actions';

import { IStore } from 'app/shared/interfaces/store.interface';
import { profileInitialState } from './auth.initial-state';
import { IProfile } from './auth.interfaces';

import { environment } from 'environments/environment';

@Injectable()
export class AuthServiceImpl {
  constructor(private http: HttpClient, private store$: Store<IStore>) {}

  getHttpHeaders(hasToken: boolean) {
    const token = localStorage.getItem('token') || '';
    const header = {
      token: hasToken ? token : '',
    };
    return new HttpHeaders(header);
  }

  checkEmailExist(email: string): Observable<any> {
    return this.http
      .get(`${environment.urlBackend}/emailExists/${email}`)
      .pipe();
  }

  registerPhone(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/registerWithOtpId`, params)
      .pipe(
        tap(data => {
          this.setLoginData(data.result || {});
        })
      );
  }

  verifyPhone(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/verifyPhone`, params, {
        headers: this.getHttpHeaders(false),
      })
      .pipe();
  }

  verifyOtp(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/verifyOtp`, params, {
        headers: this.getHttpHeaders(false),
      })
      .pipe(
        map(res => res),
        tap(data => {
          if (data.result.utoken) {
            this.setLoginData(data.result || {});
          }
        })
      );
  }

  resendCode(params: any): Observable<any> {
    return this.http.post(`${environment.urlBackend}/sendSMS`, params).pipe();
  }

  fetchUserData(): Observable<IProfile> {
    return this.http
      .get(`${environment.urlBackend}/userProfile`, {
        headers: this.getHttpHeaders(true),
      })
      .pipe(map(userDetails => profileInitialState(userDetails['result'])));
  }

  sendUserData(userDetails): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/userProfile`, userDetails, {
        headers: this.getHttpHeaders(true),
      })
      .pipe(map(res => res));
  }

  sendOtpCode(phoneInfo: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/verifyPhone`, phoneInfo, {
        headers: this.getHttpHeaders(false),
      })
      .pipe(map(res => res));
  }

  sendPhonenoForOtp(code): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/sendSMS`, code, {
        headers: this.getHttpHeaders(true),
      })
      .pipe(map(res => res));
  }

  private setLoginData(tokenResponse: any) {
    localStorage.setItem('token', tokenResponse.utoken);
    this.store$.dispatch(new AuthActions.FetchUserData());
  }

  initializeStore() {
    this.store$.dispatch(new BrandActions.ClearBrandList());
    this.store$.dispatch(new LeaseActions.ClearLeaseInfo());
    this.store$.dispatch(new ModelActions.ClearModelList());
    this.store$.dispatch(new MyRequestActions.ClearRequestList());
    this.store$.dispatch(new ConfigurationActions.ClearDetail());
    this.store$.dispatch(new TrimActions.ClearTrimList());
    this.store$.dispatch(new CreditActions.ClearCreditApplicationData());
    this.store$.dispatch(new UiActions.ClearUiInfo());
    this.store$.dispatch(new AuthActions.ClearUserInfo());
  }

  signOut() {
    this.clearAuthInfo();
    this.http
      .post(`${environment.urlBackend}/logout`, {
        headers: this.getHttpHeaders(true),
      })
      .pipe(map(res => res));
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isLoggedIn(): boolean {
    return !!(this.getToken() || localStorage.getItem('token'));
  }

  getUserID(): number {
    const userID =
      JSON.parse(localStorage.getItem('auth')) &&
      JSON.parse(localStorage.getItem('auth')).user &&
      JSON.parse(localStorage.getItem('auth')).user.id;
    return userID;
  }

  clearAuthInfo() {
    localStorage.removeItem('token');
    this.initializeStore();
  }
}
