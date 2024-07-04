import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as commonModels from 'app/shared/models/common.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientFilesService {
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

    return this.http.get<any>(this.API_PATH + `/client-files`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getClientApplicationUrl(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/client-files/download/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getClientApplicationsByEmail(email: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/client-files/${email}`, {
      headers: this.getHttpHeaders(),
    });
  }
}
