import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})

export class SkillTypeService {
  routePath: String = 'skillType';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveSkillType(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveSkillType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getSkillTypeList(param: object): Observable<any> {
    return this.apiService.get(`${this.routePath}/getSkillTypeList`).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteSkillType(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteSkillType`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }
}
