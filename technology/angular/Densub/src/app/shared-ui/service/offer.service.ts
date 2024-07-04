import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  offer: String = 'offers';
  fromInvitation  = false;
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public addOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/addOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public addMultipleOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/addMultipleOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public updateMultipleOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/updateMultipleOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public addRequestRevisionReason(param: object): Observable<any> {
    return this.apiService.post(`${this.offer}/requestRevisionReason`, param).pipe(
     map(data => {
       return data;
     })
   );
  }
  public rejectRequestRevisionReason(param: object): Observable<any> {
    return this.apiService.post(`${this.offer}/rejectRequestRevisionReason`, param).pipe(
     map(data => {
       return data;
     })
   );
  }
  public getAllOffers(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getAllOffers`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getJobOfferIds(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getJobOfferIds`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public deleteOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/deleteOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public deleteAllOffer(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/deleteAllOffer`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public upcommingContracts(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/upcommingContracts`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getTotal(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/getTotal`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public checkBooking(param: object): Observable<any> {
     return this.apiService.post(`${this.offer}/checkBooking`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getAllCancelledOffers(param: object): Observable<any> {
    return this.apiService.post(`${this.offer}/getAllCancelledOffers`, param).pipe(
     map(data => {
       return data;
     })
   );
 }

  // public removeBid(param: object): Observable<any> {
  //   return this.apiService.delete(`${this.bid}/removeBid`, param).pipe(
  //     map(data => {
  //       return data;
  //     })
  //   );
  // }
}
