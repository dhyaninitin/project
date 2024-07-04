import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class AccessLevelService {
  accessLevel: string = 'accessLevel';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }
 
  public saveAccessLevel(param: object): Observable<any> {
    return this.apiService.post(`${this.accessLevel}/saveAccessLevel`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public getAccessLevels(param: object): Observable<any> {
    return this.apiService.get(`${this.accessLevel}/getAccessLevels`).pipe(map(
        data => {
          return data
        }
    ));
  }
  public deleteAccessLevel(param: object): Observable<any> {
    return this.apiService.delete(`${this.accessLevel}/deleteAccessLevel`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
