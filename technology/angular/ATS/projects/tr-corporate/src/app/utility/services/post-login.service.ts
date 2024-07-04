import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { EMPTY, forkJoin, throwError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AccountList_response } from '../../dashboard/shared/interfaces/account-list';
import { secure_api_routes } from '../configs/apiConfig';
import { LSkeys } from '../configs/app.constants';
import { setAccountList } from '../store/actions/account.action';
import { IaccountList } from '../store/interfaces/account';
import { State } from '../store/reducers';

@Injectable({
  providedIn: 'root'
})
export class PostLoginService {

  constructor(
    private http: HttpClient,
    private lsServ: LstorageService,
    private store: Store<State>) { }

  loadPostLoginData() {
    return this.http.get<AccountList_response>(secure_api_routes.ACCOUNT_LIST)
      .pipe(mergeMap(res => {
        if (!res.error) {
          const accountList: IaccountList[] = res.data;
          this.store.dispatch(setAccountList({ data: accountList }));
          // store default account id in LS
          this.lsServ.remove(LSkeys.DEFAULT_ACCOUNT);
          this.lsServ.store(LSkeys.DEFAULT_ACCOUNT, accountList[0].accountid);
          return this.preLoadData();
        } else return [];
      }))
  }

  preLoadData() {
    const apis = [
      this.http.get(secure_api_routes.ACCOUNT),
      this.http.get(secure_api_routes.USER),
      this.http.get(secure_api_routes.USER_ROLES),
      this.http.get(secure_api_routes.TRANSLATION),
      this.http.get(secure_api_routes.BUSINESS_VERTICLE),
    ];

    return forkJoin(apis);
  }
}

