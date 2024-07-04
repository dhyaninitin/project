import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class PositionTypeService {

  positionType: String = 'positionType';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public savePositionType(param: object): Observable<any> {
    return this.apiService.post(`${this.positionType}/savePositionType`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public getPositionType(param: object): Observable<any> {
    return this.apiService.post(`${this.positionType}/getPositionType`,param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public deletePositionType(param: object): Observable<any> {
    return this.apiService.delete(`${this.positionType}/deletePositionType`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
