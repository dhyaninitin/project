import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})

export class UsersService {
  users: String = 'users';
  flag = 0;
  constructor(private http: HttpClient, private apiService: ApiService) {}

  public doSignin(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/doSignin`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public doSignup(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/doSignup`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public changeSatus(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/doSignup`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getUsers(param: object = {}): Observable<any> {
    // const post = param ? param:{};
    return this.apiService.post(`${this.users}/getUsers`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public resendVerificationEmail(param: object = {}): Observable<any> {
    return this.apiService.post(`${this.users}/resendVerificationEmail`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getAdminInfo(param: object = {}): Observable<any> {
    return this.apiService.post(`${this.users}/getAdminInfo`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getRoles(param: object): Observable<any> {
    return this.apiService.get(`${this.users}/getRoles`).pipe(
      map(data => {
        return data;
      })
    );
  }

  public deleteUser(param: object): Observable<any> {
    return this.apiService.delete(`${this.users}/deleteUser`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public emailAlreadyExits(param: any): any {
    return this.apiService.post('users/emailAlreadyExits', param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getUserInfo(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/getUserInfo`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public getUserInfoWithDetails(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/getUserInfoWithDetails`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  public forgotPassword(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/forgotPassword`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

    public saveUserData(param: object): Observable<any> {
      return this.apiService.post(`${this.users}/doSignup`, param).pipe(
        map(data => {
          return data;
        })
      );
    }

    public searchStaff(param: object): Observable<any> {
      return this.apiService.post(`${this.users}/searchStaff`, param).pipe(
        map(data => {
          return data;
        })
      );
    }

    public geocodeAddress(url: string): Observable<any> {
      return this.apiService.apiCall(`${url}`).pipe(map(
          data => {
            return data;
          }
      ));
    }

  public updateCalendar(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/updateCalendar`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getExpiredLicense(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/getExpiredLicense`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public sendNotificationToAdmin(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/sendNotificationToAdmin`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public updateUser(param: object): Observable<any> {
    return this.apiService.post(`${this.users}/updateUser`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getUserById(param: object = {}): Observable<any> {
    // const post = param ? param:{};
    return this.apiService.post(`${this.users}/getUserById`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
  
  public getSearchResults(param: object = {}): Observable<any> {
    // const post = param ? param:{};
    return this.apiService.post(`${this.users}/getSearchResults`, param).pipe(
      map(data => {
        return data;
      })
    );
  }

  public getUsersBasedOnLocation(param: object = {}): Observable<any> {
    // const post = param ? param:{};
    return this.apiService.post(`${this.users}/getUsersBasedOnLocation`, param).pipe(
      map(data => {
        return data;
      })
    );
  }
}
