import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import { User } from 'app/shared/models/user.model';
import * as userModel from 'app/shared/models/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  private API_PATH = environment.apiUrl;
  public isEdit: boolean = true;

  constructor(
    private http: HttpClient,
    private authenticationService$: AuthService
  ) {}

  getHttpHeaders() {
    return new HttpHeaders({
      Authorization: `${localStorage.getItem('authorization')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getList(requestParams: userModel.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: JSON.stringify(requestParams.filter),
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/users`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/user/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getLogsById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/user/${id}/logs`, {
      headers: this.getHttpHeaders(),
    });
  }

  //SEPARATE   FUNCITON  for getting logs
  getLogsByUserId(id: string,logModels: logModels.Filter): Observable<any> {
    let paramObj = {
      page: logModels.page.toString(),
      per_page: logModels.per_page.toString(),
    };
    // if (logModels.search.trim()) {
    //   paramObj = Object.assign(paramObj, { search: logModels.search });
    // }
    
    return this.http.get<any>(this.API_PATH + `/user/${id}/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  create(payload: User): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/user`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  update(id: number, payload: User): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/user/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  toggle(id: number, payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/user/${id}/toggle`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/user/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  getCreatedByList(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/users/getCreatedBy`, {
      params: Object(),
      headers: this.getHttpHeaders(),
    });
  }


  getUserLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }
    return this.http.get<any>(this.API_PATH + `/user/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  // Email and SMS routes
  
  syncMailInbox(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/email/syncMailInbox`, {
      headers: this.getHttpHeaders(),
    });
  }

  syncMailSentBox(): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/email/syncMailSentBox`, {
      headers: this.getHttpHeaders(),
    });
  }

  getMailList(requestParams: commonModels.Filter,email:string): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    return this.http.get<any>(this.API_PATH + `/email/${email}`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  sendMail(data: any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/email/send`, data, {
      headers: this.getHttpHeaders(),
    });
  }

  sendReply(data: any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/email/sendReply`, data, {
      headers: this.getHttpHeaders(),
    });
  }

  changeMailStatus(token:any):Observable<any>{
    return this.http.get<any>(this.API_PATH + `/email/${token}/inbox`, {
      headers: this.getHttpHeaders(),
    });
  }

  getUploadPresignedUrl(filetype: string) {
    return this.http.get<any>(this.API_PATH + `/email/createPresignedUrl?filetype=${filetype}`, {
      headers: this.getHttpHeaders(),
    });
  }

  uploadFileOnPresignedUrl(url: any, file: any) {
    return this.http.put<any>(url, file);
  }

  getMessageDetails(id: number) {
    return this.http.get<any>(this.API_PATH + `/email/${id}/show`, {
      headers: this.getHttpHeaders(),
    });
  }

  getAttachment(filedetails: any) {
    return this.http.post<any>(this.API_PATH + `/email/download`, filedetails , {
      headers: this.getHttpHeaders(),
    });
  }

  getzimbraMails(id: number, email: string) {
    return this.http.get<any>(this.API_PATH + `/email/${id}/${email}/show/list`, {
      headers: this.getHttpHeaders(),
    });
  }

  getSMSList(requestParams: commonModels.Filter,phone:string): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: 0,
      per_page: 100,
      to_number: phone
    };
    return this.http.post<any>(this.API_PATH + `/sms/sms/list`, paramObj, {
      headers: this.getHttpHeaders(),
    });
  }

  getSMSdetails(id: number) {
    return this.http.get<any>(this.API_PATH + `/sms/details/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  sendSMS(data: any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/sms/send`, data, {
      headers: this.getHttpHeaders(),
    });
  }


  getOutGoingCallList(requestParams: commonModels.Filter,phonenumber: any) {
    
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      to_number: phonenumber
    };
    return this.http.post<any>(this.API_PATH + `/call`, paramObj , {
      // params: paramObj,
      headers: this.getHttpHeaders(),
    }).toPromise();
  }

  getIncomingCallList(requestParams: commonModels.Filter,phonenumber: any) {
    
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
      to_number: phonenumber
    };
    return this.http.post<any>(this.API_PATH + `/call/incoming`, paramObj , {
      // params: paramObj,
      headers: this.getHttpHeaders(),
    }).toPromise();
  }

  getTwilioToken():Observable<any> {
    return this.http.get<any>(this.API_PATH + `/call/token`, {
      headers: this.getHttpHeaders(),
    });
  }

  getcallRecordUrl(data:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/call/recording`, data , {
      headers: this.getHttpHeaders(),
    });
  }

  checkContactSecondaryEmail(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/user/secondary-email`, payload , {
      headers: this.getHttpHeaders(),
    });
  }

  checkContactSecondaryPhoneNumber(payload:any):Observable<any> {
    return this.http.post<any>(this.API_PATH + `/user/secondary-phone`, payload , {
      headers: this.getHttpHeaders(),
    });
  }
}
