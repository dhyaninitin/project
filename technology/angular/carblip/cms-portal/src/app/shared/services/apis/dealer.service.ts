import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import {
  Dealer,
  DealerContact,
  NewDealerContact,
} from 'app/shared/models/dealer.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class DealerService {
  private API_PATH = environment.apiUrl;
  isEdit: boolean = true;
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

  getList(requestParams: commonModels.Filter, dealer_id=null): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search && requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    if (dealer_id != null && !requestParams.search && !requestParams.search.trim()) {
      paramObj['dealer_id'] = dealer_id;
    }
    
    return this.http.get<any>(this.API_PATH + `/dealers`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getAll(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/dealers/all`, {
      headers: this.getHttpHeaders(),
    });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/dealer/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: Dealer): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/dealers`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: Object): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/dealer/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/dealer/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getListContacts(requestParams): Observable<any> {
    let paramObj = {
      dealer_id: requestParams.dealer_id,
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search && requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/dealer-contacts`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  createContact(payload: NewDealerContact): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/dealer-contacts`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  updateContact(id: number, payload: DealerContact): Observable<any> {
    return this.http.put<any>(
      this.API_PATH + `/dealer-contact/${id}`,
      payload,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/dealer-contact/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
}
