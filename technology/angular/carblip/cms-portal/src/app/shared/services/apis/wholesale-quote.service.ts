import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import * as wholesaleQuoteModels from 'app/shared/models/wholesale-quote.model';
import { NewWholesaleQuote, WholesaleQuote, History } from 'app/shared/models/wholesale-quote.model';
import { AuthService } from '../auth/auth.service';
import * as logModels from 'app/shared/models/log.model';

@Injectable()
export class WholesaleQuoteService {
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

  getList(requestParams: wholesaleQuoteModels.Filter, wholesale_id = null): Observable<any> {
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

    if (wholesale_id != null && !requestParams.search && !requestParams.search.trim()) {
      paramObj['wholesale_id'] = wholesale_id;
    }

    return this.http.get<any>(this.API_PATH + '/wholesalequotes/all', {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getHistory(id: string, requestParams: commonModels.Filter) {
    let paramObj = {
      id: id,
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/wholesalequote/${id}/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders()
    })
  }

  createHistory(requestParams: History): Observable<any> {
    const payload = {
      content: requestParams.content,
      action: requestParams.action,
      category: requestParams.category,
      target_id: requestParams.target_id,
      target_type: requestParams.target_type,
      portal_user_name: requestParams.portal_user_name,
      portal_user_id: requestParams.portal_user_id,
    };
    return this.http.post<any>(this.API_PATH + '/logs/create', payload, {
      headers: this.getHttpHeaders(),
    })
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequote/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }


  getQuotesByRegisterUser(requestParams): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      user_id: requestParams.user_id,
      wholesale_quote_id: requestParams.wholesale_quote_id
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/wholesalequote/getquotes`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }
  create(requestParams: NewWholesaleQuote): Observable<any> {
    const payload = {
      // request_id: requestParams.request_id,
      data: requestParams.data,
    };
    return this.http.post<any>(this.API_PATH + '/wholesalequote', payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: string, requestParams: WholesaleQuote): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/wholesalequote/${id}`, requestParams, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/wholesalequote/${id}`, {
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

    return this.http.get<any>(this.API_PATH + `/wholesalequote/${id}/alluser_quotes`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuoteYears(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequotes/years`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuoteMakes(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequotes/make`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuoteModels(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequotes/models`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuoteSalespersons(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequotes/salespersons`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuoteNewCarSalespersons(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/wholesalequotes/newcarsalespersons`, {
      headers: this.getHttpHeaders(),
    });
  }

  getWholesaleQuotesLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/wholesalequote/list/history?`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

}
