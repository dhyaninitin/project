import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Utility
import { api_routes, secure_api_routes } from '../../../utility/configs/apiConfig';
import { UtilityService } from '../../../utility/services/utility.service';

// Interfaces
import { AccountList_response } from '../../shared/interfaces/account-list';
import { ExistingInvitedUser_request, ExistingInvitedUser_response } from '../interfaces/invited-user';


@Injectable({
  providedIn: 'root'
})
export class AccountListApiService {
  private api_routes;
  private secure_api_routes;
  constructor(private http: HttpClient, private utilityServ: UtilityService) {
    this.api_routes = api_routes;
    this.secure_api_routes = secure_api_routes;
  }


  getAccountList() {
    return this.http.get<AccountList_response>(secure_api_routes.ACCOUNT_LIST)
  }

  validateInvite(data: ExistingInvitedUser_request) {
    return this.http.post<ExistingInvitedUser_response>(api_routes.VERIFICATION, data)
  }
}
