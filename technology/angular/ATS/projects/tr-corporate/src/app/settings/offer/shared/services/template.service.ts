//import { GetUser_request, GetUser_response } from '../interfaces/get-user';
import { GetUser_request, GetUser_response } from '../../../permission/shared/interfaces/get-user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UtilityService } from '../../../../utility/services/utility.service';
import { api_routes, secure_api_routes } from '../../../../utility/configs/apiConfig';

// Interdaces

//import { DesignationSearch_response } from '../../interfaces/designation-autosearch';
import { DesignationSearch_response } from '../../../permission/shared/interfaces/designation-autosearch';
import { Practice_response } from '../../../permission/shared/interfaces/practice';
import { ReinviteUser_request } from '../../../permission/shared/interfaces/reinvite-user';
import { AddUser_request, AddUser_response } from '../../../permission/shared/interfaces/add-user';
//import { Practice_response } from '../interfaces/practice';
//import { ReinviteUser_request } from '../interfaces/reinvite-user';
// Interfaces
//import { AddUser_response, AddUser_request } from '../interfaces/add-user';
import { DeleteUser_request, DeleteUsers_request } from '../../../permission/shared/interfaces/delete-user';
//import { DeleteUsers_request, DeleteUser_request, DeleteUser_response } from '../interfaces/delete-user';
import { UpdateUser_request, UpdateUser_response } from '../../../permission/shared/interfaces/update-user';
import { UpdateUsersStatus_request, UpdateUserStatus_request } from '../../../permission/shared/interfaces/update-user-status';
import { ExportCSV_reponse } from '../../../permission/shared/interfaces/export-csv';
import { DeleteUser_response } from '../../../permission/shared/interfaces/delete-user';
import { UpdateUserStatus_response } from '../../../permission/shared/interfaces/update-user-status';
import { BehaviorSubject } from 'rxjs';
import { ComponentPayload, OfferComponentVLookUpPayload, Offer_VLookUp_Response } from '../interfaces/create-offer-component';
import { Generic_Settings_Response } from '../interfaces/generic-settings';
import { GenericSettingsPayload } from '../interfaces/genericSettings';
import { Offer_Activity_Response } from '../interfaces/offer-activity';
import { Offer_Component_Response, Offer_Delete_Response, Offer_Document_Response, Offer_Insert_Response, Update_response, UploadToS3 } from '../interfaces/offer-setting';
@Injectable({
    providedIn: 'root'
})
export class TemplateService {
    enableFinish: boolean = false;
    uploadedExcelObject: any = [];
    private api_routes;
    fileLocalPath: string = '';
    private secure_api_routes;
    public firstForm = new BehaviorSubject<Object>(Object);
    public finalForm = new BehaviorSubject<Object>(Object);
    public componentsList = new BehaviorSubject<[]>([]);
    constructor(private http: HttpClient, private utilityServ: UtilityService) {
        this.api_routes = api_routes;
        this.secure_api_routes = secure_api_routes;
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
      
      // For Offer Template Creation

      //Create component by template id
      createComponentsByTempId(payload: ComponentPayload) {
        const url = `${secure_api_routes.COMPONENTS_BY_TEMPLATEID}`
        return this.http.post<Offer_Component_Response>(url, payload);
      }

      //Get component by template id
      getComponentsByTempId(templateid: string) {
        const url = `${secure_api_routes.COMPONENTS_BY_TEMPLATEID}?templateid=${templateid}`
        return this.http.get<Offer_Component_Response>(url);
      }

      // Update component by component id
      updateComponentsById(payload: ComponentPayload) {
        const url = `${secure_api_routes.COMPONENTS_BY_TEMPLATEID}`
        return this.http.put<Update_response>(url, payload);
      }

      // Delete component by component id
      deleteComponentsById(componentid: string) {
        const url = `${secure_api_routes.COMPONENTS_BY_TEMPLATEID}?offercomponentid=${componentid}`
        return this.http.delete<Offer_Delete_Response>(url);
      }

       // Delete component by component id
       deleteAllComponentsById(templateid: string) {
        const url = `${secure_api_routes.DELETE_ALL_COMPONENT_BY_TEMPLATEID}?templateid=${templateid}`
        return this.http.delete<Offer_Delete_Response>(url);
      }

      //get Generic Setting
      getGenericSetting(){
        const url = `${secure_api_routes.GET_GENERIC_SETTINGS}`
        return this.http.get<Generic_Settings_Response>(url);
      }

      updateGenericSetting(payload: GenericSettingsPayload){
        const url = `${secure_api_routes.UPDATE_GENERIC_SETTINGS}`
        return this.http.put<Update_response>(url, payload);
      }

      // Get offer Activities
      getOfferActivity(templateid: string, from: string, to:string){
        const url = `${secure_api_routes.GET_OFFER_ACTIVITY}?templateid=${templateid}&from=${from}&to=${to}`
        return this.http.get<Offer_Activity_Response>(url);
      }

      deleteAllOfferActivity(templateid: string){
        const url = `${secure_api_routes.GET_OFFER_ACTIVITY}?templateid=${templateid}`
        return this.http.delete<Offer_Delete_Response>(url);
      }

       // Get offer VLookUp JSON
      getOfferVLookInfo(templateid: string){
        const url = `${secure_api_routes.OFFER_VLOOKUP_JSON}?templateid=${templateid}`
        return this.http.get<Offer_VLookUp_Response>(url);
      }

      //Create component by template id
      createVlookUpDocRecord(payload: OfferComponentVLookUpPayload) {
        const url = `${secure_api_routes.OFFER_VLOOKUP_JSON}`
        return this.http.post<Offer_Insert_Response>(url, payload);
      }

      updateVlookUpByTemplateId(payload: OfferComponentVLookUpPayload){
        const url = `${secure_api_routes.OFFER_VLOOKUP_JSON}`
        return this.http.put<Update_response>(url, payload);
      }
}