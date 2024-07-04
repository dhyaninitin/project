import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class EmailTemplatesService {
  template: String = 'emailTemplates';
  constructor(
    private apiService: ApiService
  ) {}

  public saveTemplate(param: object): Observable<any> {
     return this.apiService.post(`${this.template}/saveTemplate`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public preview(param: object): Observable<any> {
     return this.apiService.post(`${this.template}/preview`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getTemplate(param: object): Observable<any> {
    return this.apiService.post(`${this.template}/getTemplate`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public deleteTemplate(param: object): Observable<any> {
     return this.apiService.post(`${this.template}/deleteTemplate`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
