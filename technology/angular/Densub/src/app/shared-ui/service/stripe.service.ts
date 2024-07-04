import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from './../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  workDiary: String = 'stripe';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public createCharge(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/createCharge`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public createAutoCharge(param: object): Observable<any> {
    return this.apiService.post(`${this.workDiary}/createAutoCharge`, param).pipe(
     map(data => {
       return data;
     })
   );
 }

  public retrieveCard(param: object): Observable<any> {
    return this.apiService.post(`${this.workDiary}/retrieveCard`, param).pipe(
     map(data => {
       return data;
     })
   );
 }

  public createSource(param: object): Observable<any> {
      return this.apiService.post(`${this.workDiary}/createSource`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  // public stripeTotalAmt(amount) {
  //   const final_amount = amount + (amount * 0.029 + 0.30) + (amount * 0.029 + 0.30) * 0.029 +
  //   ((amount * 0.029 + 0.30) * 0.029) * 0.029 + (((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029 +
  //   ((((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029) * 0.029;

  //   return Number((final_amount * 100).toFixed(0));
  // }


  // public connectStripe(param: object): Observable<any> {
  //    return this.http.get(`${environment.STRIPE_URL}`).pipe(
  //     map(data => {
  //       return data;
  //     })
  //   );
  // }

}

/* public stripeTotalAmt(amount) {
    const final_amount = amount + (amount * 0.029 + 0.30) + (amount * 0.029 + 0.30) * 0.029 +
    ((amount * 0.029 + 0.30) * 0.029) * 0.029 + (((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029 +
    ((((amount * 0.029 + 0.30) * 0.029) * 0.029) * 0.029) * 0.029;

    return Number((final_amount * 100).toFixed(0));
  } */
