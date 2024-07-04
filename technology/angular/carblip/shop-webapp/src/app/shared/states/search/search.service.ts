import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  IRequestFecthList,
  ISearchResponse,
} from 'app/shared/states/search/search.interfaces';
import { environment } from 'environments/environment';

// when creating a service, you should use an abstract class to describe your methods
// this way you'll have the possibility to :
// - make sure you've got the same parameters and return types between the real service and the mock
// - search for references in Visual Studio Code and find your mock aswell on a method
@Injectable()
export abstract class SearchService {
  abstract fetchSearchList(
    requestParam: IRequestFecthList
  ): Observable<ISearchResponse>;
}
@Injectable()
export class SearchServiceImpl extends SearchService {
  constructor(private http: HttpClient) {
    super();
  }

  fetchSearchList(
    requestParam: IRequestFecthList
  ): Observable<ISearchResponse> {
    return this.http
      .post(`${environment.urlBackend}/searchVehicles`, requestParam)
      .pipe(map(result => result['data']));
  }
}
