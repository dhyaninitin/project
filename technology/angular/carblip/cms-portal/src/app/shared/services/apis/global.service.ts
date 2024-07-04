import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private API_PATH = environment.apiUrl;
  constructor(
    private http: HttpClient
  ) { }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getByIdAndName(filter_section_name: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/tables/${filter_section_name}`, {
      headers: this.getHttpHeaders(),
    });
  }

  createAndUpdate(payload: {filter_section_name: string, column: Array<{}>}): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/tables/columnFilters`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  createPageAndServerLogs(payload: {type: number, username: string, page: string}): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/logs/not-found`, payload, {
      headers: this.getHttpHeaders(),
    });
  }
}
