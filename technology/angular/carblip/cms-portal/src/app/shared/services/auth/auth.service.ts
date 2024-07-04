import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import { AuthUserResonse, UpdateUser } from 'app/shared/models/user.model';
import { LocalStorageService } from 'app/shared/services/local-storage.service';
import { ClearDetail as authClearDetail } from 'app/store/auth/authentication.action';
import { ClearDetail as portalUsersClearDetail } from 'app/store/portalusers/portalusers.actions';
import { ClearDetail as locationsClearDetail } from 'app/store/locations/locations.actions';
import { ClearDetail as requestClearDetail } from 'app/store/requests/requests.actions';
import { ClearDetail as usersClearDetail } from 'app/store/users/users.actions';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

@Injectable()
export class AuthService {
  private API_PATH = environment.apiUrl + '/auth';
  constructor(
    private http: HttpClient,
    private store$: Store<AppState>,
    private permissionsService: NgxPermissionsService,
    private rolesService: NgxRolesService,
    private localStorageService: LocalStorageService
  ) {}

  getToken(): string {
    return localStorage.getItem('authorization');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_PATH}/login`, {
      email,
      password,
    });
  }

  logout(): Observable<any> {
    return this.http.get(`${this.API_PATH}/logout`, {
      headers: this.getHttpHeaders(),
    });
  }

  clearStore() {
    this.permissionsService.flushPermissions();
    this.rolesService.flushRoles();
    this.store$.dispatch(new authClearDetail());
    this.store$.dispatch(new usersClearDetail());
    this.store$.dispatch(new locationsClearDetail());
    this.store$.dispatch(new portalUsersClearDetail());
    this.store$.dispatch(new requestClearDetail());
  }

  getUserInfo(): Observable<AuthUserResonse> {
    return this.http.get<any>(`${this.API_PATH}/user`, {
      headers: this.getHttpHeaders(),
    });
  }

  updateUserInfo(payload: UpdateUser): Observable<AuthUserResonse> {
    return this.http.put<any>(`${this.API_PATH}/user`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/forgetpassword`, {
      email,
      "WEB_URL": environment.weburl
    });
  }

  resetPassword(data:any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/changepassword`,data, {
      headers: this.getHttpHeaders(),
    }
    );
  }

  verifyOtp(paylaod:any){
    return this.http.post<any>(`${this.API_PATH}/verify`,paylaod, {
      headers: this.getHttpHeaders(),
    }
    );
  }
}
