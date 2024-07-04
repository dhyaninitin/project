import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import { NewVendorContact, VendorContact, Vendors } from 'app/shared/models/vendors.model';
import * as commonModels from 'app/shared/models/common.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class VendorsService {
  private API_PATH = environment.apiUrl;

  isEdit: boolean = true;
  
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

  /** list api for vendor users
   * @param requestparam filter options
   * @return observable
   **/

  getList(requestParams: commonModels.Filter, vendor_id = null): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    if (vendor_id != null && !requestParams.search && !requestParams.search.trim()) {
      paramObj['vendor_id'] = vendor_id;
    }
    return this.http.get<any>(this.API_PATH + `/vendors`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  /** list api for vendor by filter
   * @param requestparam filter options
   * @return observable
   **/

  getListByFilter(requestParams: object): Observable<any> {
    return this.http.post<any>(
      this.API_PATH + `/vendors/byFilter`,
      requestParams,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  /** get vendor by id
   * @param id: string
   * @return observable
   **/
  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/vendor/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: Vendors): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/vendors`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: Vendors): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/vendor/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/vendor/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getListContacts(requestParams): Observable<any> {
    let paramObj = {
      target_id: requestParams.vendor_id,
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search && requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/portal-contacts`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  createContact(payload: VendorContact): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/portal-contacts`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  updateContact(id: number, payload: VendorContact): Observable<any> {
    return this.http.put<any>(
      this.API_PATH + `/portal-contact/${id}`,
      payload,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/portal-contact/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }
}
