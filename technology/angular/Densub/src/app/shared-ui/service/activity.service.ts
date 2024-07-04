import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  activity: String = 'activity';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public addActivity(param: object): Observable<any> {
     return this.apiService.post(`${this.activity}/addActivity`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  
  public getActivityJob(param: object): Observable<any> {
     return this.apiService.post(`${this.activity}/getActivityJob`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public removeActivity(param: object): Observable<any> {
    return this.apiService.delete(`${this.activity}/removeActivity`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public updateActivity(param: object): Observable<any> {
    return this.apiService.delete(`${this.activity}/updateActivity`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
