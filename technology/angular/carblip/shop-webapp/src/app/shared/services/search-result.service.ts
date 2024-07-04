import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from 'environments/environment';

@Injectable()
export class SearchResultService {
  constructor(private http: HttpClient) {}

  fetchSearchResult(params: any): Observable<any> {
    return this.http
      .post(`${environment.urlBackend}/getInventoryCount`, params)
      .pipe();
  }
}
