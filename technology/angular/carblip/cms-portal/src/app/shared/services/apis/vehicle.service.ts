import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class VehicleService {
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

    return this.http.get<any>(this.API_PATH + `/vehicles`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getListByUserid(id:string,requestParams: commonModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      id: id,
    };

    return this.http.get<any>(this.API_PATH + `/request/${id}/alluser_requests`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getAll(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/vehicles/byFilter`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }

  getAllBrandsByYear(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/requestsBrandByYear`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }
  getAllByModelsByBrandYear(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/requestsModelByYear`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }
  getAlRequestSources(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/allRequestSources`, {
      headers: this.getHttpHeaders(),
    });
  }
  getAlRequestReferrals(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/request/allRequestReferrals`, {
      headers: this.getHttpHeaders(),
    });
  }

  getDealsStagepipeline(requestParams: any){
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/requests/deals/pipeline`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getDealsForBoardView(requestParams:any){
    let paramObj = {
      pipeline: requestParams.pipeline,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      deal_stage: requestParams.deal_stage,
      filters: JSON.stringify(requestParams.filters),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/requests/board-view`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  updateDealStage(payload:{deal_stage: string}, id: number ): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/requests/dealstage/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  
}
