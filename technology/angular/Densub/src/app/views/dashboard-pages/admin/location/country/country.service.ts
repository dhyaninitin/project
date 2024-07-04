import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  routePath: String = 'country';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveCountry(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveCountry`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getCountryList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getCountryList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteCountry(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteCountry`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
