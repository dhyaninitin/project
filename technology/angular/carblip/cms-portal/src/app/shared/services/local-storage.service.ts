import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class LocalStorageService {
  storeAuthInfo(userInfo: any) {}
  loadUserInfo(): Observable<any> {
    return of({});
  }

  storeAuthorization(authorization: string) {
    localStorage.setItem('authorization', authorization);
  }

  setData(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  getData(key: string) {
    return localStorage.getItem(key);
  }

  clear() {
    localStorage.clear();
  }

  resetSession(): any {}
}
