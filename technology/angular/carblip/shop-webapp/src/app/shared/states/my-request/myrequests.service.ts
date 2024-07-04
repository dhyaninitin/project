import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { myRequestInitialState } from 'app/shared/states/my-request/myrequests.initial-state';
import { IRequest } from 'app/shared/states/my-request/myrequests.interfaces';
import { environment } from 'environments/environment';

@Injectable()
export abstract class MyReqeustService {
  abstract fetchRequestList(params: any): Observable<IRequest[]>;
}
@Injectable()
export class MyRequestServiceImpl extends MyReqeustService {
  constructor(private http: HttpClient) {
    super();
  }

  getHttpHeaders(hasToken: boolean) {
    const token = localStorage.getItem('token') || '';
    const header = {
      'Content-Type': 'application/json',
      token: hasToken ? token : '',
    };
    return new HttpHeaders(header);
  }

  fetchRequestList(requestParams: any): Observable<IRequest[]> {
    return this.http
      .get(`${environment.urlBackend}/getVehicleRequests`, {
        headers: this.getHttpHeaders(true),
      })
      .pipe(
        map(response => {
          if (response['success']) {
            const requests = response['data']['data'] || [];
            return requests.map(request => myRequestInitialState(request));
          }
          return [];
        })
      );
  }
}
