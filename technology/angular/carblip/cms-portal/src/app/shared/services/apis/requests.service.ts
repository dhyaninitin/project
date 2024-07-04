import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import * as requestModels from 'app/shared/models/request.model';
import { NewRequest, Request,UpdateRequest } from 'app/shared/models/request.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RequestService {
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

  getList(requestParams: requestModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: JSON.stringify(requestParams.filter),
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/requests`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getLogsById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/${id}/logs`, {
      headers: this.getHttpHeaders(),
    });
  }

  getDeleteLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/requests/delete-log`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  create(requestParams: NewRequest): Observable<any> {
    const payload = {
      user_id: requestParams.user_id.toString(),
      vehicle_id: requestParams.vehicle_id.toString(),
      dealstage_id: requestParams.dealstage_id.toString(),
      portal_deal_stage: requestParams.portal_deal_stage.toString(),
    };

    return this.http.post<any>(this.API_PATH + `/request`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/request/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
  getYears(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/getRequestYears`, {
      headers: this.getHttpHeaders(),
    });
  }

  getQuoteLogsByIds(payload: requestModels.RequestQuoteLogFilter): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/request/quotes/logs`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: UpdateRequest): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/request/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  // Sync Hubspot deal for concierge
  syncAndStoreDeal(requestParams: NewRequest): Observable<any> {
    const payload = {
      user_id: requestParams.user_id.toString(),
      dealstage_id: requestParams.dealstage_id.toString(),
      portal_deal_stage: requestParams.portal_deal_stage.toString(),
    };

    return this.http.post<any>(this.API_PATH + `/request/createWithNAOption`, payload, {
      headers: this.getHttpHeaders(),
    });
  }
}
