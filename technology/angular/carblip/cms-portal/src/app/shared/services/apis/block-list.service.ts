import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import * as blocklistModels from 'app/shared/models/block-list.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class BlockListService {
    private API_PATH = environment.apiUrl;
    constructor(
        private http: HttpClient,
        private authenticationService$: AuthService
    ) { }

    getHttpHeaders() {
        return new HttpHeaders({
            Authorization: `${localStorage.getItem('authorization')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        });
    }

    getList(requestParams: commonModels.Filter): Observable<any> {
        let paramObj = {
            order_by: requestParams.order_by,
            order_dir: requestParams.order_dir,
            page: requestParams.page.toString(),
            per_page: requestParams.per_page.toString(),
        };
        if (requestParams.search.trim()) {
            paramObj = Object.assign(paramObj, { search: requestParams.search });
        }

        return this.http.get<any>(this.API_PATH + `/phonelimit/all`, {
            params: paramObj,
            headers: this.getHttpHeaders(),
        });
    }

    delete(id: Array<Number>): Observable<any> {
        //In future, we will make it as delete
        return this.http.post<any>(this.API_PATH + `/phonelimit/delete`, {ids: id},{
            headers: this.getHttpHeaders()
        }); 
    }
}
