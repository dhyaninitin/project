import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import * as requestModels from 'app/shared/models/request.model';
import { Request } from 'app/shared/models/request.model';
import { AuthService } from '../auth/auth.service';
import * as usersModels from 'app/shared/models/user.model';

@Injectable()
export class ExportService {
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

  postRequest(requestParams: requestModels.ExportFilter) {
    let paramObj = {
      type: 'request',
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: JSON.stringify(requestParams.filter),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.post<any>(this.API_PATH + `/export/deals`, paramObj, {
      headers: this.getHttpHeaders(),
    });
  }

  postQuote(requestParams: Object) {
    return this.http.post<any>(this.API_PATH + `/export/quote`, requestParams, {
      headers: this.getHttpHeaders(),
    });
  }

  postQuotePrint(requestParams: Object) {
    return this.http.post<any>(this.API_PATH + `/export/quote-print`, requestParams, {
      headers: this.getHttpHeaders(),
    });
  }

  postWholeSaleQuotePrint(requestParams: Object) {
    return this.http.post<any>(this.API_PATH + `/export/wholesale-quote-print`, requestParams, {
      headers: this.getHttpHeaders(),
    });
  }

  postContact(requestParams: usersModels.ExportFilter) {
    let paramObj = {
      type: 'contact',
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: JSON.stringify(requestParams.filter),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.post<any>(this.API_PATH + `/export/contact`, paramObj, {
      headers: this.getHttpHeaders(),
    });
  }
}
