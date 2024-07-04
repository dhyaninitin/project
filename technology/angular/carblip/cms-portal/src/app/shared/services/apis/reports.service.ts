import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { AuthService } from '../auth/auth.service';
import * as commonModels from 'app/shared/models/common.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private API_PATH = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private authenticationService$: AuthService
  ) { }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getRegisteredUsersReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    if(paramObj.contact_owner == "0" || paramObj.contact_owner == "") {
      delete paramObj['contact_owner']
    }

    return this.http.get<any>(this.API_PATH + `/reports/reg-users?filter=${JSON.stringify(paramObj)}`, {
      headers: this.getHttpHeaders(),
    });
  }

  
  getRequestsReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    if(paramObj.contact_owner == "0" || paramObj.contact_owner == "") {
      delete paramObj['contact_owner']
    }

    return this.http.get<any>(this.API_PATH + `/reports/requests?filter=${JSON.stringify(paramObj)}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getQuotesReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    if(paramObj.contact_owner == "0" || paramObj.contact_owner == "") {
      delete paramObj['contact_owner']
    }

    return this.http.get<any>(this.API_PATH + `/reports/quotes?filter=${JSON.stringify(paramObj)}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getQuotesRevenueReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    return this.http.get<any>(this.API_PATH + `/reports/quotes-revenue`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getQuotesContactOwnersList(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source.toString()
    };
    return this.http.get<any>(this.API_PATH + `/reports/quotes-contactowner`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuotesReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    if(paramObj.contact_owner == "0" || paramObj.contact_owner == "") {
      delete paramObj['contact_owner']
    }

    return this.http.get<any>(this.API_PATH + `/reports/wholeSale?filter=${JSON.stringify(paramObj)}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuotesRevenueReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source,
      contact_owner: requestParams.contact_owner
    };
    return this.http.get<any>(this.API_PATH + `/reports/wholeSale-revenue`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getWholsaleQuotesContactOwnersList(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source.toString()
    };
    return this.http.get<any>(this.API_PATH + `/reports/wholeSale-contactowner`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getPurchaseOrderReport(requestParams: any): Observable<any> {
    let paramObj = {
      start_date: requestParams.start_date,
      end_date: requestParams.end_date,
      source: requestParams.source
    };
    return this.http.get<any>(this.API_PATH + `/reports/purchase-order`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  exportReportCharts(filter: any): Observable<any> {
    if(filter.type == 'registered-user' || filter.type == 'export-request' || filter.type == 'export-quotes' || filter.type == 'export-wholesaleQuotes'  ) {
      let requestParams = JSON.parse(filter.filter);
      if(requestParams.contact_owner == "0" || requestParams.contact_owner == "") {
        delete requestParams['contact_owner']
      }
    }

    return this.http.post<any>(this.API_PATH + `/export/reports`,filter, {
      headers: this.getHttpHeaders(),
    });
  }

  /** Get RR schedule details by email
 * @param get all source  
 * @returns observable
 */
  getsource() {
    return this.http.get(this.API_PATH + `/request/allRequestSources`, {
      headers: this.getHttpHeaders(),
    });
  }
}
