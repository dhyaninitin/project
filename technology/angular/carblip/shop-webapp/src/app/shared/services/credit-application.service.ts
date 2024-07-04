import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from 'environments/environment';

@Injectable()
export class CreditApplicationService {
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

  getCreditApplication(id: number): Observable<any> {
    return this.http
      .get(`${environment.urlBackend}/getCreditApplication/${id}`, {
        headers: this.getHttpHeaders(true),
      })
      .pipe();
  }

  saveCreditApplication(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/saveCreditApplication`, params, {
        headers: this.getHttpHeaders(true),
      })
      .pipe();
  }
}
