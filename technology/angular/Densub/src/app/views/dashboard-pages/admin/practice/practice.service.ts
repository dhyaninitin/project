import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  practice: string = 'practice';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public savePractice(param: object): Observable<any> {
    return this.apiService.post(`${this.practice}/savePractice`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getPractice(param: object): Observable<any> {
    return this.apiService.post(`${this.practice}/getPractice`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deletePractice(param: object): Observable<any> {
    return this.apiService.delete(`${this.practice}/deletePractice`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
