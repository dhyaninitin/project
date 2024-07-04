import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { admin_api_routes } from "../enums/route.enum";
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private http: HttpClient) { }

  refreshUserTableSubject = new Subject<any>();
  refreshDailyDiaryComSubject = new Subject<any>();

  formatUtcAccordingToTimezone(timeZone: any, createdAt: any) {
    return moment.utc(createdAt).tz(timeZone).format('ddd, DD MMM YYYY hh:mm A');
  }

  // USER API's
  addUser(id: any, data: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.ADD_USER}/${id}`, data);
  }

  getUsers(page: number, limit: number, search: string, orderBy: string, orderDir: string): Observable<any> {
    return this.http.get<any>(
      `${admin_api_routes.GET_USERS}?page=${page}&limit=${limit}&search=${search}&orderBy=${orderBy}&orderDir=${orderDir}`,
      {}
    );
  }

  updateUser(id: string, adminId: any, payload: any): Observable<any> {
    return this.http.put<any>(
      `${admin_api_routes.UPDATE_USER}/${id}/${adminId}`,
      payload
    );
  }

  deleteUser(data: string, adminId: any): Observable<any> {
    return this.http.delete<any>(
      `${admin_api_routes.DELETE_USER}/${adminId}?Ids=${data}`,
      {}
    );
  }

  sendEmail(data: any, adminId: any): Observable<any> {
    return this.http.post<any>(
      `${admin_api_routes.SEND_EMAIL}/${data.id}/${adminId}`,
      data
    );
  }

  logoutUser(data: any): Observable<any> {
    return this.http.put<any>(
      `${admin_api_routes.LOGOUT_USER}`, data
    );
  }

  getUserDailyData(id: any, page: number, size: number) {
    return this.http.get<any>(
      `${admin_api_routes.GET_USER_DAILY_DATA}/${id}?page=${page}&limit=${size}`
    );
  }

  getUserWeeklyData(id: any, page: number, size: number) {
    return this.http.get<any>(
      `${admin_api_routes.GET_USER_WEEKLY_DATA}/${id}?page=${page}&limit=${size}`
    );
  }

  getUserMonthlyData(id: any, page: number, size: number) {
    return this.http.get<any>(
      `${admin_api_routes.GET_USER_MONTHLY_DATA}/${id}?page=${page}&limit=${size}`
    );
  }

  updateUserStatus(id: any, status: any, adminId: any): Observable<any> {
    return this.http.put<any>(`${admin_api_routes.UPDATE_USER_STATUS}/${id}/${adminId}`, {
      status,
    });
  }

  exportFromTo(adminId: any, data: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.EXPORT}/${adminId}`, data);
  }

  filterUserReports(value: any, data: any) {
    return this.http.get<any>(
      `${admin_api_routes.FILTER_USER_REPORTS}?value=${value}&from=${data.from}&to=${data.to}`,
      {}
    );
  }

  getUsersFromTo(payload: any) {
    return this.http.post<any>(`${admin_api_routes.GET_USERS_FROM_TO}`, payload)
  }

  deleteUserScreehshot(adminId: any, selectedScreenshots: any, todayDate: any) {
    return this.http.post<any>(`${admin_api_routes.DELETE_USER_SCREENSHOT}/${adminId}?todayDate=${todayDate}`, selectedScreenshots)
  }

  // User Permissions API's

  getUsersPermission(page: number, limit: number, search: string, orderBy: string, orderDir: string): Observable<any> {
    return this.http.get<any>(
      `${admin_api_routes.GET_USERS_PERMISSION}?page=${page}&limit=${limit}&search=${search}&orderBy=${orderBy}&orderDir=${orderDir}`,
      {}
    );
  }

  addUserPermission(id: any, data: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.ADD_USER_PERMISSION}/${id}`, data);
  }

  updateUserPermission(id: string, adminId: any, payload: any): Observable<any> {
    return this.http.put<any>(
      `${admin_api_routes.UPDATE_USER_PERMISSION}/${id}/${adminId}`,
      payload
    );
  }

  deleteUserPermission(adminId: any, data: string): Observable<any> {
    return this.http.delete<any>(
      `${admin_api_routes.DELETE_USER_PERMISSION}?adminId=${adminId}&Ids=${data}`,
      {}
    );
  }

  updateUserStatusInPermission(id: any, status: any, adminId: any): Observable<any> {
    return this.http.put<any>(`${admin_api_routes.UPDATE_USER_STATUS_IN_PERMISSION}/${id}/${adminId}`, {
      status,
    });
  }

  sendEmailToUserPermission(data: any, adminId: any): Observable<any> {
    return this.http.post<any>(
      `${admin_api_routes.SEND_EMAIL_TO_USER_PERMISSION}/${data.id}/${adminId}`,
      data
    );
  }

  getHistory(page: number, limit: number, from: string, to: string, type: number, search: string): Observable<any> {
    return this.http.get<any>(
      `${admin_api_routes.GET_HISTORY}?page=${page}&limit=${limit}&from=${from}&to=${to}&type=${type}&search=${search}`,
      {})
  }

  getTrackerErrorLogs(page: number, limit: number, search: string): Observable<any> {
    return this.http.get<any>(
      `${admin_api_routes.GET_TRACKER_ERROR_LOGS}?page=${page}&limit=${limit}&search=${search}`,
      {})
  }

  deleteLogByIds(data: any): Observable<any> {
    return this.http.delete<any>(
      `${admin_api_routes.DELETE_LOGS_BY_IDS}?ids=${data.ids}`,
      {})
  }

  trackerMarkAsRead(data: any): Observable<any> {
    return this.http.put<any>(`${admin_api_routes.TRACKER_MARKED_AS_READ}`, data)
  }

}
