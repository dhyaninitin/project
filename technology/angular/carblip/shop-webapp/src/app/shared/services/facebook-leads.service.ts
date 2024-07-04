import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from 'environments/environment';

@Injectable()
export class FacebookLeadsService {
  constructor(private http: HttpClient) {}

  storeLeadsInfo(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/updateFacebookLeadInfo`, params)
      .pipe();
  }

  getLeadsInfo(uri): Observable<any> {
    const payload = {
      uri: uri,
    };
    return this.http
      .post(`${environment.urlBackend}/getFacebookLeadInfo`, payload)
      .pipe();
  }

  verifyEmail(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/facebookLeadsHook`, params)
      .pipe();
  }
}
