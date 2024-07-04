import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import * as commonModels from 'app/shared/models/common.model';
import { PurchaseOrder, History } from 'app/shared/models/purchase-order.model';

@Injectable()
export class PurchaseOrderService {
  private API_PATH = environment.apiUrl;
  constructor(
    private http: HttpClient,
  ) { }

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  /** list api for purchase order
   * @param requestparam filter options
   * @return observable
   **/
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

    return this.http.get<any>(this.API_PATH + `/purchaseorders`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getPurchaseOrder(requestParams): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      quote_id:requestParams.quote_id,
      wholesale_id:requestParams.wholesale_id,
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/purchaseorders/getbyquote`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }
  /** list api for  purchase order by filter
   * @param requestparam filter options
   * @return observable
   **/
  getListByFilter(requestParams: object): Observable<any> {
    return this.http.post<any>(
      this.API_PATH + `/purchaseorders/all`,
      requestParams,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  /** get  purchase order by id
   * @param id: string
   * @return observable
   **/
  getById(id: number): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/purchaseorder/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: PurchaseOrder): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/purchaseorders`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: PurchaseOrder): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/purchaseorder/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/purchaseorder/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getHistory(id: string, requestParams: commonModels.Filter) {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/purchaseorder/${id}/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders()
    })
  }

  createHistory(requestParams: History): Observable<any> {
    const payload = {
      content: requestParams.content,
      action: requestParams.action,
      category: requestParams.category,
      target_id: requestParams.target_id,
      target_type: requestParams.target_type,
      portal_user_name: requestParams.portal_user_name,
      portal_user_id: requestParams.portal_user_id,
    };
    return this.http.post<any>(this.API_PATH + '/logs/create', payload, {
      headers: this.getHttpHeaders(),
    })
  }
}
