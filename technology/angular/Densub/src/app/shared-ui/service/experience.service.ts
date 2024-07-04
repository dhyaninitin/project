import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';


@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  routePath: String = 'experience';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveExperience(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveExperience`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getExperienceList(param: object): Observable<any> {
    return this.apiService.get(`${this.routePath}/getExperienceList`).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deleteExperience(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteExperience`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
