import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { Filter, Inventory } from 'app/shared/models/inventory.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class InventoryService {
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

  getList(requestParams: Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      filter: JSON.stringify(requestParams.filter),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/minventories`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getAll(requestParams: any): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/minventories/byFilter`, {
      params: requestParams,
      headers: this.getHttpHeaders(),
    });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/minventory/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  fetchData(): Observable<any> {
    const payload = {};

    return this.http.post<any>(
      this.API_PATH + `/minventories/fetch-data`,
      payload,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }
}
