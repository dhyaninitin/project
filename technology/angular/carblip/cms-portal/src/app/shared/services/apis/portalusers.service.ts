import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

import { PortalUser, UpdatePortalUser } from 'app/shared/models/portaluser.model';
import * as commonModels from 'app/shared/models/common.model';
import * as logModels from 'app/shared/models/log.model';
import { AuthService } from '../auth/auth.service';
import * as portalusersModels from 'app/shared/models/portaluser.model';
import { StyleUtils } from '@angular/flex-layout';

@Injectable()
export class PortalUserService {
  private API_PATH = environment.apiUrl;
  public isRoundRobinAllow: boolean = false;
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

  /** list api for portal users
   * @param requestparam filter options
   * @return observable
   **/

  getList(requestParams: portalusersModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: requestParams.filter == undefined ? '{}' : JSON.stringify(requestParams.filter),
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/portalusers`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  /** list api for portal users by filter
   * @param requestparam filter options
   * @return observable
   **/

  getListByFilter(requestParams: object): Observable<any> {
    return this.http.post<any>(
      this.API_PATH + `/portalusers/byFilter`,
      requestParams,
      {
        headers: this.getHttpHeaders(),
      }
    );
  }

  /** list api for portal users with no phone assigned
   * @param requestparam filter options
   * @return observable
   **/

  getListWithNoPhoneAssigned(requestParams: portalusersModels.Filter): Observable<any> {
    let paramObj = {
      order_by: requestParams.order_by,
      order_dir: requestParams.order_dir,
      filter: requestParams.filter == undefined ? '{}' : JSON.stringify(requestParams.filter),
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/portalusers/with-nophone-assigned`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  /** get portal user by id
   * @param id: string
   * @return observable
   **/
  getById(id: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/portaluser/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  /** get logs by portal user id
   * @param id: string
   * @return observable
   **/
  getLogsById(id: string, requestParams): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };
    return this.http.get<any>(this.API_PATH + `/portaluser/${id}/logs`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  /** get delete logs
   * @param requestParams: Filter
   * @return observable
   **/
  getDeleteLogs(requestParams: logModels.Filter): Observable<any> {
    let paramObj = {
      page: requestParams.page.toString(),
      per_page: requestParams.per_page.toString(),
    };

    if (requestParams.search.trim()) {
      paramObj = Object.assign(paramObj, { search: requestParams.search });
    }

    return this.http.get<any>(this.API_PATH + `/portalusers/delete-log`, {
      params: paramObj,
      headers: this.getHttpHeaders(),
    });
  }

  /** create api for portal users
   * @param PortalUser user data
   * @return observable
   **/
  create(payload: UpdatePortalUser): Observable<any> {


    return this.http.post<any>(this.API_PATH + `/portaluser`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /** update api for portal users
   * @param UpdatePortalUser object for user data
   * @return observable
   **/
  update(id: number, payload: UpdatePortalUser): Observable<any> {
    return this.http.put<any>(this.API_PATH + `/portaluser/${id}`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /** rr update api for portal users
   * @param Boolean rr status
   * @return observable
   **/
  updateRR(id: number, status: Boolean): Observable<any> {
    const payload = {
      status,
    };
    return this.http.put<any>(this.API_PATH + `/portaluser/${id}/rr`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /** Get RR schedule details by email
   * @param email 
   * @returns observable
   */
  getrrSchedule(email: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/rr/get-rr/${email}`, {
      headers: this.getHttpHeaders(),
    });
  }

  /** To Update schedule for assigned round robin user
   * @param payload
   * @returns observable
   */
  updateRRSchedule(payload: any) {
    return this.http.put<any>(this.API_PATH + `/rr/update-rr`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /**
   * Make a round robin user as a default user
   * @param email 
   * @returns 
   */
  makeAsDefaultUser(email: string) {
    const payload = {
      email: email
    }
    return this.http.put<any>(this.API_PATH + `/rr/rrdefaultuser`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /** Get RR schedule details by email
   * @param get all source  
   * @returns observable
   */
  getsource() {
    return this.http.get(this.API_PATH + `/request/allRequestSources`, {
      headers: this.getHttpHeaders(),
    });
  }

  /** toggle api for portal user
   * @param Object payload
   * @return observable
   **/
  toggle(id: number, payload: Object): Observable<any> {
    return this.http.post<any>(this.API_PATH + `/portaluser/${id}/toggle`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  /** delete api for portal users
   * @param number id
   * @return observable
   **/
  delete(id: number): Observable<any> {
    return this.http.delete<any>(this.API_PATH + `/portaluser/${id}`, {
      headers: this.getHttpHeaders(),
    });
  }

  /** list api for portal users based on user role
  * @return observable
  **/

  getOwnerListByRole(from: number): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/portalusers/filterByRole/${from}`, {
      headers: this.getHttpHeaders(),
    });
  }

  //Generate url to upload image on S3
  uploadProfile(extension: string, image: File) {
    let formData = new FormData();
    formData.append('file', image);
    return this.http.post<any>(this.API_PATH + `/profile/upload?extension=${extension}`, formData,{
      headers: new HttpHeaders({
        Authorization: `${localStorage.getItem('authorization')}`
      })
    });
  }

  //upload file on S3
  uploadfiles(email:string,uploadto:string,fileExtention:string, image: File) {
    let formData = new FormData();
    let payload = {
      user_email:email,
      upload_to:uploadto,
      extension: fileExtention
    };
    

    formData.append('file', image);
    return this.http.post<any>(this.API_PATH + `/file/upload`, formData,{
      params: payload,
      headers: new HttpHeaders({
        Authorization: `${localStorage.getItem('authorization')}`
      })
    });
  }

  /**
   * This function is used to get all available phone numbers from twilio
   * @param country 
   * @returns 
   */
  getAvailablePhoneNumbers(areacode: string, contains: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/sms/${areacode}/availablenumbers?contains=${contains}`, {
      headers: this.getHttpHeaders(),
    });
  }

  /**
   * This function is used to claim on available phone number from twilio
   * @param phoneNumber 
   * @returns 
   */
  claimAvailablePhoneNumbers(phoneNumber: string): Observable<any> {
    return this.http.get<any>(this.API_PATH + `/sms/${phoneNumber}/claim`, {
      headers: this.getHttpHeaders(),
    });
  }

  storeCarblipAssignedNumber(phone: string, userid: number) {
    const payload = {
      phone: phone,
      portal_user_id: userid
    };
    return this.http.post<any>(this.API_PATH + `/phonenumbers/store`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  twoFactorAuthenticate(){
    return this.http.get<any>(this.API_PATH + `/two-factor/token`, {
      headers: this.getHttpHeaders(),
    });
  }

  verifyOTP(payload:any){
    return this.http.post<any>(this.API_PATH + `/two-factor/verify`, payload, {
      headers: this.getHttpHeaders(),
    });
  }

  sendSMSotp(){
    return this.http.get<any>(this.API_PATH + `/two-factor/send-otp`, {
      headers: this.getHttpHeaders(),
    });
  }

  turnOffTwoFA() {
    return this.http.post<any>(this.API_PATH + `/two-factor/off`, {}, {
      headers: this.getHttpHeaders(),
    });
  }
}
