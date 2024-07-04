import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DisputeService {
  dispute: String = 'disputes';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public addDispute(param: object): Observable<any> {
     return this.apiService.post(`${this.dispute}/addDispute`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getDisputes(param: object): Observable<any> {
     return this.apiService.post(`${this.dispute}/getDisputes`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

/*   public getBid(param: object): Observable<any> {
     return this.apiService.post(`${this.bid}/getBid`, param).pipe(
      map(data => {
        return data;
      })
    );
  } */

}
