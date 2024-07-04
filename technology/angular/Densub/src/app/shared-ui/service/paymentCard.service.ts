import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})

export class PaymentCardService {
    routePath: String = 'paymentCard';
    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    public savePaymentCard(param: object): Observable<any> {
        return this.apiService.post(`${this.routePath}/savePaymentCard`, param).pipe(map(
            data => {
                return data;
            }
        ));
    }

    public getPaymentCardDetail(param: object): Observable<any> {
        return this.apiService.post(`${this.routePath}/getPaymentCardDetail`, param).pipe(map(
            data => {
                return data;
            }
        ));
    }
    public getPaymentCard(param: object): Observable<any> {
        return this.apiService.post(`${this.routePath}/getPaymentCard`, param).pipe(map(
            data => {
                return data;
            }
        ));
    }

    public deletePaymentCard(param: object): Observable<any> {
        return this.apiService.post(`${this.routePath}/deletePaymentCard`, param).pipe(map(
            data => {
                return data;
            }
        ));
    }

    public setCardAsPrimary(param: object): Observable<any> {
        return this.apiService.post(`${this.routePath}/setCardAsPrimary`, param).pipe(map(
            data => {
                return data;
            }
        ));
    }

}
