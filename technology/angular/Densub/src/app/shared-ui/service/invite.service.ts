/* import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class InviteService {
  invite: String = 'invite';
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public sendInvitation(param: object): Observable<any> {
     return this.apiService.post(`${this.invite}/sendInvitation`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getInvitation(param: object): Observable<any> {
     return this.apiService.post(`${this.invite}/getInvitation`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getInvitationList(param: object): Observable<any> {
     return this.apiService.post(`${this.invite}/getInvitationList`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

}
 */
