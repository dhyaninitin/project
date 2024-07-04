import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PhoneNumbersListService {
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

        return this.http.get<any>(this.API_PATH + `/phonenumbers/all`, {
            params: paramObj,
            headers: this.getHttpHeaders(),
        });
    }

    delete(id: number, phone: string): Observable<any> {
        const payload = {
            id: id,
            phone: phone
        }
        return this.http.post<any>(this.API_PATH + `/phonenumbers/delete`, payload,{
            headers: this.getHttpHeaders()
        }); 
    }

    showAssignedNumber(userId?): Observable<any> {
        let paramObj = userId ? { userid:userId } : null
        return this.http.get<any>(this.API_PATH + `/phonenumbers/show`,{
            params: paramObj,
            headers: this.getHttpHeaders()
        }); 
    }

    update(data: {id: number, portalUserId: number}): Observable<any> {
        let payload = { portal_user_id: data.portalUserId }
        return this.http.put<any>(this.API_PATH + `/phonenumbers/${data.id}`, payload, {
            headers: this.getHttpHeaders()
        }); 
    }
}
