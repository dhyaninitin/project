import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from 'environments/environment';

@Injectable()
export class CreateRequestService {
  constructor(private http: HttpClient) {}

  getHttpHeaders(hasToken: boolean) {
    const token = localStorage.getItem('token') || '';
    const header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      token: hasToken ? token : '',
    };
    return new HttpHeaders(header);
  }

  createRequestFromPreference(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/createRequestFromPreferences`, params, {
        headers: this.getHttpHeaders(true),
      })
      .pipe();
  }

  createRequestFromCustom(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/createRequestFromCustom`, params, {
        headers: this.getHttpHeaders(true),
      })
      .pipe();
  }
}
