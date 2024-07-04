import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class CommissionService {

  commission: string = 'commission';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveCommission(param: object): Observable<any> {
    return this.apiService.post(`${this.commission}/saveCommission`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public getCommission(param: object): Observable<any> {
    return this.apiService.post(`${this.commission}/getCommission`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public deleteCommission(param: object): Observable<any> {
    return this.apiService.delete(`${this.commission}/deleteCommission`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
