import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  payment: String = 'payment';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }


  public savePaymentDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.payment}/savePaymentDetails`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getPaymentList(param: object): Observable<any> {
    return this.apiService.post(`${this.payment}/getPaymentList`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getPaymentDetails(param): Observable<any> {
    return this.apiService.post(`${this.payment}/getPayment`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

}
