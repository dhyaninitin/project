import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { Location, UpdateLocation } from 'app/shared/models/location.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class LocationService {
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
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/locations`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: UpdateLocation): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/location`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: UpdateLocation): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/location/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/location/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
}
