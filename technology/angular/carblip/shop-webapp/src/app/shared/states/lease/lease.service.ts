import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { leaseInitialState } from './lease.initial-state';
import { ILease } from './lease.interfaces';

import { environment } from 'environments/environment';

@Injectable()
export abstract class LeaseService {
  abstract fetchLeaseInfo(requestParam: any): Observable<ILease>;
}
@Injectable()
export class LeaseServiceImpl extends LeaseService {
  constructor(private http: HttpClient) {
    super();
  }

  getHttpHeaders(hasToken: boolean) {
    const header = {
      token: hasToken ? localStorage.getItem('token') : '',
    };
    return new HttpHeaders(header);
  }

  fetchLeaseInfo(params: any): Observable<ILease> {
    return this.http
      .post(
        `${environment.urlBackend}/getLeaseInformation`,
        {},
        {
          headers: this.getHttpHeaders(true),
        }
      )
      .pipe(map(data => leaseInitialState(data['data'])));
  }
}
