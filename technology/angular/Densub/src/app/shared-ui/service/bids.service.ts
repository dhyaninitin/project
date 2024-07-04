// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { ApiService } from './api.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class BidService {
//   bid: String = 'bids';
//   constructor(private http: HttpClient, private apiService: ApiService) {}

//   public addBid(param: object): Observable<any> {
//      return this.apiService.post(`${this.bid}/addBid`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }
//   public addMultipleBid(param: object): Observable<any> {
//      return this.apiService.post(`${this.bid}/addMultipleBid`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }
//   public updateMultipleBid(param: object): Observable<any> {
//      return this.apiService.post(`${this.bid}/updateMultipleBid`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }
//   public getBids(param: object): Observable<any> {
//      return this.apiService.post(`${this.bid}/getBids`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }

//   public getBid(param: object): Observable<any> {
//      return this.apiService.post(`${this.bid}/getBid`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }

//   public removeBid(param: object): Observable<any> {
//     return this.apiService.delete(`${this.bid}/removeBid`, param).pipe(
//       map(data => {
//         return data;
//       })
//     );
//   }
// }
