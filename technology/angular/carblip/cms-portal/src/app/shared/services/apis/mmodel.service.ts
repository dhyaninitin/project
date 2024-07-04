import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { Model } from 'app/shared/models/mmodel.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MModelService {
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

    return this.http.get<any>(this.API_PATH + `/mmodels`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getAll(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/mmodels/byFilter`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/mmake/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
}
