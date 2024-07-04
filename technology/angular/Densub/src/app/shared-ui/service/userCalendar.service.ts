import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserCalendarService {
  route: String = 'userCalendar';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public saveUserCalendar(param: object): Observable<any> {
     return this.apiService.post(`${this.route}/saveUserCalendar`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getUserCalendar(param: object): Observable<any> {
     return this.apiService.post(`${this.route}/getUserCalendar`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public deleteUserCalendar(param: object): Observable<any> {
     return this.apiService.post(`${this.route}/deleteUserCalendar`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public updateCalendarDates(param: object): Observable<any> {
     return this.apiService.post(`${this.route}/updateCalendarDates`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public insertCalendarDates(param: object): Observable<any> {
     return this.apiService.post(`${this.route}/insertCalendarDates`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
