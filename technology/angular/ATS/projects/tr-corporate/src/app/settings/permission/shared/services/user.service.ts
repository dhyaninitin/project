import { GetUser_request, GetUser_response } from '../interfaces/get-user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UtilityService } from '../../../../utility/services/utility.service';
import { api_routes, secure_api_routes } from '../../../../utility/configs/apiConfig';

// Interdaces

import { DesignationSearch_response } from '../interfaces/designation-autosearch';
import { Practice_response } from '../interfaces/practice';
import { ReinviteUser_request } from '../interfaces/reinvite-user';
// Interfaces
import { AddUser_response, AddUser_request } from '../interfaces/add-user';
import { UpdateUser_request, UpdateUser_response, } from '../interfaces/update-user';
import { DeleteUsers_request, DeleteUser_request, DeleteUser_response } from '../interfaces/delete-user';
import { UpdateUsersStatus_request, UpdateUserStatus_request, UpdateUserStatus_response } from '../interfaces/update-user-status';
import { ExportCSV_reponse } from '../interfaces/export-csv';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api_routes;
  private secure_api_routes;
  constructor(private http: HttpClient, private utilityServ: UtilityService) {
    this.api_routes = api_routes;
    this.secure_api_routes = secure_api_routes;
  }

  getUser(email: string) {
    return this.http.get<GetUser_response>(`${this.secure_api_routes.GET_USER}?email=${email}`, { headers: { 'email': email } })
  }
  createUser(data: AddUser_request) {
    return this.http.post<AddUser_response>(this.secure_api_routes.ADD_USER, data)
  }
  updateUser(data: UpdateUser_request) {
    return this.http.put<UpdateUser_response>(this.secure_api_routes.UPDATE_USER, data)
  }
  updateUserStatus(data: UpdateUserStatus_request) {
    return this.http.put<UpdateUserStatus_response>(this.secure_api_routes.UPDATE_USER_STATUS, data)
  }

  reinviteUser(data: ReinviteUser_request) {
    return this.http.post<AddUser_response>(this.secure_api_routes.REINVITE_USER, data)
  }
  deleteUser(data: DeleteUser_request) {
    return this.http.patch<DeleteUser_response>(this.secure_api_routes.DELETE_USER, data)
  }
  getTotalUserRoles(limit:number) {
    const url = `${secure_api_routes.USER_ROLES}?limit=${limit}&offset=0`
    return this.http.get(url);
}

  //for export data
  exportFile(downloadType: number) {
    const url = `${secure_api_routes.EXPORT_FILE}?exporttype=${downloadType}`;
    return this.http.post<ExportCSV_reponse>(url, {})
  } 
 
  designationAutoSearch(searchQuery:any){
    return this.http.get<DesignationSearch_response>(`${this.secure_api_routes.DESIGNATION_AUTOSEARCH}/autosearch?searchQuery=${searchQuery}`)
  }
  getPractice(searchObj:any){
    return this.http.get<Practice_response>(`${this.secure_api_routes.PRACTICE_LIST}/autosearch?searchObj=${searchObj}`)
  }
  updateUsers(data: UpdateUser_request) {
    return this.http.put<UpdateUser_response>(this.secure_api_routes.UPDATE_USER, data)
  }


  deleteUsers(data: DeleteUsers_request) {
    return this.http.put<DeleteUser_response>(this.secure_api_routes.UPDATE_USER_STATUS, data)
  }

  updateUsersStatus(data: UpdateUsersStatus_request) {
    return this.http.put<UpdateUserStatus_response>(this.secure_api_routes.UPDATE_USER_STATUS, data)
  }

  //for export data in csv format
  exportCsv (downloadType: number) {
    const url = `${secure_api_routes.EXPORT_CSV}?exporttype=${downloadType}`;
    return this.http.post<ExportCSV_reponse>(url, {})
  } 

}
