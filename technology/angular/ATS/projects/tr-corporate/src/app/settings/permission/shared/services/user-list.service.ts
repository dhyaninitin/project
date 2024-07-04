import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_routes, secure_api_routes } from '../../../../utility/configs/apiConfig';
import { UtilityService } from '../../../../utility/services/utility.service';
import { UserList_response } from '../interfaces/user-list';

@Injectable({
  providedIn: 'root'
})
export class UserListService {
  private api_routes;
  private secure_api_routes;
  constructor(private http: HttpClient, private utilityServ: UtilityService) {
    this.api_routes = api_routes;
    this.secure_api_routes = secure_api_routes;
  }

  getUserList(accountID: string, limit: number, offset: number, options?: { sort?: string, sortOrder?: string, filter_roletypeid?: number, filter_status?: number }) {
    let url = `${this.secure_api_routes.USER_LIST}?limit=${limit}&offset=${offset}`;

    if (options?.sort) {
      url = `${url}&orderby=${options.sort}`;
    }
    if (options?.sortOrder) {
      url = `${url}&order=${options.sortOrder}`;
    }

    if (options?.filter_roletypeid) {
      url = `${url}&filter_roletypeid=${options.filter_roletypeid}`;
    }
    if (options?.filter_status) {
      url = `${url}&filter_status=${options.filter_status}`;
    }


    return this.http.get<UserList_response>(url, { headers: { 'accountID': accountID } })
  }

}
