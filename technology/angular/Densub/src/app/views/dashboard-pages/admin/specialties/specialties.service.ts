import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../../shared-ui/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  routePath: String = 'specialty';
  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  public saveSpecialty(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/saveSpecialty`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public getSpecialtyList(param: object): Observable<any> {
    return this.apiService.post(`${this.routePath}/getSpecialtyList`,param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  public deleteSpecialty(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/deleteSpecialty`, param).pipe(map(
        data => {
          return data;
        }
    ));
  }

  /* public updateManySpecialty(param: object): Observable<any> {
    return this.apiService.delete(`${this.routePath}/updateManySpecialty`, param).pipe(map(
        data => {
          return data
        }
    ));
  } */
}
