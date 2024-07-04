import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  routePath: String = 'address';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveAddress(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveAddress`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getAddressList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getAddressList`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getAddressWithDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getAddressWithDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteAddress(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteAddress`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
