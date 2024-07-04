import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as portalusersModels from 'app/shared/models/portaluser.model';


@Injectable({
  providedIn: 'root'
})
export class ConciergeUserSettingsService {

  private API_PATH = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getPortalUsersList(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/workflow-setting`, {
      headers: this.getHttpHeaders(),
    });
  }

  saveConciergeSettings(payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/concierge-user-setting`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  getList(requestParams: portalusersModels.Filter): Observable<any> {
    console.log(requestParams)
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: requestParams.filter == undefined ? '{}' : JSON.stringify(requestParams.filter),
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/portalusers`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }
  
}
