import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';

// Utility
import { secure_api_routes } from '../../../utility/configs/apiConfig';
import { LSkeys } from '../../../utility/configs/app.constants';
import { resetAccount } from '../../../utility/store/actions/account.action';
import { resetUser, setUserLoginStatus } from '../../../utility/store/actions/user.action';
import { State } from '../../../utility/store/reducers';

// Interfaces
import { Logout_response } from './../../shared/interfaces/logout';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private http: HttpClient,
    private lsServ: LstorageService,
    private store: Store<State>,) {
  }

  logout() {
    const guid = this.lsServ.getItem(LSkeys.DEVICE_GUID) || "";
    this.lsServ.remove(LSkeys.BEARER_TOKEN);
    return this.http.patch<Logout_response>(secure_api_routes.LOGOUT, {}, { headers: { 'clientuniqueid': guid } })
  }

  clearSavedData() {
    this.lsServ.remove(LSkeys.BEARER_TOKEN);
    this.lsServ.remove(LSkeys.DEFAULT_ACCOUNT);
    this.store.dispatch(setUserLoginStatus({ data: false }));
    this.store.dispatch(resetUser({ data: true }));
    this.store.dispatch(resetAccount({ data: true }));
  }
}
