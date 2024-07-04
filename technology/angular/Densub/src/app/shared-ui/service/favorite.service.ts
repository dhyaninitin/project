import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  favorite: String = 'favorite';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public addFavorite(param: object): Observable<any> {
     return this.apiService.post(`${this.favorite}/addFavorite`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getFavorite(param: object): Observable<any> {
     return this.apiService.post(`${this.favorite}/getFavoriteStaff`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getFavoriteJob(param: object): Observable<any> {
     return this.apiService.post(`${this.favorite}/getFavoriteJob`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public removeFavorite(param: object): Observable<any> {
    return this.apiService.delete(`${this.favorite}/removeFavorite`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public removeAllFavorite(param: object): Observable<any> {
    return this.apiService.delete(`${this.favorite}/removeAllFavorite`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
