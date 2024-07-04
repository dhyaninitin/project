import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  routePath: String = 'city';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveCity(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveCity`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getCityList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getCityList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteCity(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteCity`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public updateManyCity(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManyCity`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
