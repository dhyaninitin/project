import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {
  promoCode: String = 'promoCode';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }


  public addPromocode(param: object): Observable<any> {
    return this.apiService.post(`${this.promoCode}/addPromoCode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getPromoCodeList(param: object): Observable<any> {
    return this.apiService.post(`${this.promoCode}/getList`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getPromoCodeListWithDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.promoCode}/getListWithDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deletePromoCode(param: object): Observable<any> {
    return this.apiService.post(`${this.promoCode}/deletePromoCode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public checkPromoCode(param: object): Observable<any> {
    return this.apiService.post(`${this.promoCode}/checkPromoCode`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

}
