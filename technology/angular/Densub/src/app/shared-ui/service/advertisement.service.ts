import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {

  advertisement: string = 'advertisement';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveAdvertise(param: object): Observable<any> {
    return this.apiService.post(`${this.advertisement}/saveAdvertise`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
  public getAdvertiseList(param: object): Observable<any> {
    return this.apiService.get(`${this.advertisement}/getAdvertiseList`).pipe(map(
        data => {
          return data
        }
    ));
  }
  public deleteAdvertise(param: object): Observable<any> {
    return this.apiService.delete(`${this.advertisement}/deleteAdvertise`, param).pipe(map(
        data => {
          return data
        }
    ));
  }
}
