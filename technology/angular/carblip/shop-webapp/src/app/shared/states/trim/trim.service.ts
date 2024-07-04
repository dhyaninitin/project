import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { trimInitialState } from 'app/shared/states/trim/trim.initial-state';
import {
  IRequestFecthList,
  ITrim,
} from 'app/shared/states/trim/trim.interfaces';
import { environment } from 'environments/environment';

// when creating a service, you should use an abstract class to describe your methods
// this way you'll have the possibility to :
// - make sure you've got the same parameters and return types between the real service and the mock
// - search for references in Visual Studio Code and find your mock aswell on a method
@Injectable()
export abstract class TrimsService {
  abstract fetchTrimList(requestParam: IRequestFecthList): Observable<ITrim[]>;
}
@Injectable()
export class TrimServiceImpl extends TrimsService {
  constructor(private http: HttpClient) {
    super();
  }

  fetchTrimList(requestParam: IRequestFecthList): Observable<ITrim[]> {
    return this.http
      .post(`${environment.urlBackend}/getStyles`, requestParam)
      .pipe(map(trim => trim['data'].map(obj => trimInitialState(obj))));
  }
}
