import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiurl } from 'src/app/core/apiurl';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  appURL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  signUp(data: any): any {
    return this.http.post(this.appURL + apiurl.API_SIGN_UP, data);
  }

  sendFeedback(data: any): any {
    return this.http.patch(this.appURL + apiurl.API_SUBMIT_FEEDBACK, data);
  }

  adminLogin(data: any): any {
    return this.http.post(this.appURL + apiurl.API_LOGIN, data);
  }

  compareSession(sessionId: string) {
    return this.http.get(this.appURL + apiurl.API_COMPARE_SESSION + "?sessionId=" + sessionId)
  }
}
