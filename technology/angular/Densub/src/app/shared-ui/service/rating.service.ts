import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
@Injectable({
  providedIn: 'root'
})
export class RatingService {
  rating: String = 'rating';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }


  public saveRating(param: object): Observable<any> {
    return this.apiService.post(`${this.rating}/saveRating`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getRatings(param: object): Observable<any> {
    return this.apiService.post(`${this.rating}/getRatings`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public upcomingRatings(param: object): Observable<any> {
    return this.apiService.post(`${this.rating}/upcomingRatings`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getRatingsCount(param: object): Observable<any> {
    return this.apiService.post(`${this.rating}/getRatingsCount`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

}
