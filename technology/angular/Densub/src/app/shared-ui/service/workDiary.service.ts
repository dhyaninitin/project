import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class WorkDiaryService {
  workDiary: String = 'workDiary';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public addWork(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/addWorkToDiary`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getworkDiary(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/getworkDiary`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getworkDiaryDetails(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/getworkDiaryDetails`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getworkDiaryDetailsForProduct(param: object): Observable<any> {
    return this.apiService.post(`${this.workDiary}/getworkDiaryDetailsForProduct`, param).pipe(
     map(data => {
       return data;
     })
   );
 }


  public getTotalHours(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/getTotalHours`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public deleteworkDiary(param: object): Observable<any> {
     return this.apiService.post(`${this.workDiary}/deleteworkDiary`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
