import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})

export class ZipcodeService {
  routePath: String = 'zipcode';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveZipcode(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveZipcode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getZipcodeList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getZipcodeList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteZipcode(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteZipcode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public updateManyZipcode(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManyZipcode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
