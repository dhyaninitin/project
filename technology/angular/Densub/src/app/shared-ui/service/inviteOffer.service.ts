import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InviteOfferService {
  offer: String = 'inviteOffer';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public sendInviteOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/sendInviteOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getInviteOffers(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getInviteOffers`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getInviteOffersWithDetails(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getInviteOffersWithDetails`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

}
