import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { AuthService } from '../auth/auth.service';
import * as logModels from 'app/shared/models/log.model';

@Injectable()
export class DealStageService {
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

  getAll(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/dealstages`, {
      headers: this.getHttpHeaders(),
    });
  }

  getList(requestParams: commonModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/dealstages/list`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getDealStageList(requestParams: commonModels.Filter, portalDealStageId = null): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    if(portalDealStageId) {
      paramObj = Object.assign(paramObj, { portal_deal_stage: portalDealStageId });
    }
    
    return this.http.get<any>(this.API_PATH + `/portal/dealstage/list`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/portal/dealstage/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  create(data: {label: string, pipeline: string}): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/portal/dealstage`, data, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, data: {label: string, pipeline: string}): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/portal/dealstage/${id}`, data, {
      headers: this.getHttpHeaders(),
    });
  }

  refresh(): Observable<any> {
    return this.http.post<any>(
      this.API_PATH + `/dealstages/refresh`,
      {},
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  /** get logs
   * @param requestParams: Filter
   * @return observable
   **/
    getLogs(requestParams: logModels.Filter): Observable<any> {
      let paramObj = {
        page: requestParams.page.toString(),
        per_page: requestParams.per_page.toString(),
      };
  
      if (requestParams.search.trim()) {
        paramObj = Object.assign(paramObj, { search: requestParams.search });
      }
  
      return this.http.get<any>(this.API_PATH + `/portal/dealstage/logs`, {
        params: paramObj,
        headers: this.getHttpHeaders(),
      });
    }
}
