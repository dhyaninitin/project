import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { api_routes, secure_api_routes } from '../../../../utility/configs/apiConfig';
import { UtilityService } from '../../../../utility/services/utility.service';
//import { UserList_response } from '../interfaces/user-list';
import { UserList_response } from '../../../permission/shared/interfaces/user-list';
import { Offer_Count, Offer_Delete_Response, Offer_Insert_Response, Offer_Response, Offer_Update_Response } from '../interfaces/offer-setting';
import { CreateOffer } from '../interfaces/create-offer';

@Injectable({
  providedIn: 'root'
})
export class TemplateListService {
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

  // OFFER SETTINGS

  // Get All the templates
  getTemaplteList(pageNumber: number, limit: number, searchText: string, sortBy: string) {
    const url = `${secure_api_routes.GET_TEMPLATE_LIST}?pageNumber=${pageNumber}&limit=${limit}&searchText=${searchText}&sortBy=${sortBy}`
    return this.http.get<Offer_Response>(url);
  }

  // Get Total Counts
  getTemaplteCount(searchText: string) {
    const url = `${secure_api_routes.GET_TEMPLATE_COUNT}?searchText=${searchText}`
    return this.http.get<Offer_Count>(url);
  }

  // Delete template by template id
  deleteTemplateById(templateid: string) {
    const url = `${secure_api_routes.TEMPLATE}?templateid=${templateid}`
    return this.http.delete<Offer_Delete_Response>(url);
  }

  // get template by template id
  getTemplateById(templateid: string) {
    const url = `${secure_api_routes.TEMPLATE}?templateid=${templateid}`
    return this.http.get<any>(url);
  }
  
  // Update template by template id
  updateTemplateById(template: any) {
    const url = `${secure_api_routes.TEMPLATE}`
    return this.http.put<Offer_Update_Response>(url, template);
  }

  // Create Offer Template
  createOfferTemplate(payload: CreateOffer) {
    const url = `${secure_api_routes.TEMPLATE}`
    return this.http.post<Offer_Insert_Response>(url, payload);
  }
}
