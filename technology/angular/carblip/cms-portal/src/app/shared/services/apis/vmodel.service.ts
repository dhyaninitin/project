import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class VModelService {
  private API_PATH = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private authenticationService$: AuthService
  ) {}

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getList(requestParams: commonModels.Filter): Observable<any> {
    const paramObj = {};

    return this.http.get<any>(this.API_PATH + `/models`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getAll(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/models/byFilter`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }

  getAllByBrandYear(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/models/byBrandYear`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }
}
