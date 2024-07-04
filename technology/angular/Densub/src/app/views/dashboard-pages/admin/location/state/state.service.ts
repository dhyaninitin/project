import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  routePath: String = 'state';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveState(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveState`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getStateList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getStateList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteState(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteState`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public updateManyState(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManyState`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
