import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  routePath = 'skills';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveSkill(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveSkill`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public getSkills(param: object): Observable<any> {
    return this.apiService.get(`${this.routePath}/getSkills`).pipe(map(
        data => {
          return data;
        }
    ));
  }
  public deleteSkill(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteSkill`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public updateManySkill(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManySkill`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getSkillWithType(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/getSkillWithType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
