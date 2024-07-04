import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { auth_api_routes } from "../enum's/enum";
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit {
  userId: any;
  userName: any;
  userEmail: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  signup(data: any): Observable<any> {
    return this.http.post<any>(`${auth_api_routes.SIGNUP}`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${auth_api_routes.LOGIN}`, data);
  }

  forgetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${auth_api_routes.FORGET_PASSWORD}`, data);
  }

  saveGoogleLoginInfo(payload: any):Observable<any> {
    return this.http.post<any>(`${auth_api_routes.GOOGLE_LOGIN_INFO}`,payload)
  }
  
  sendOtpToUserEmail(email: any): Observable<any> {
    return this.http.post<any>(`${auth_api_routes.SEND_OTP}`, {email})
  }

  checkOtp(payload: any): Observable<any> {
    return this.http.post<any>(`${auth_api_routes.CHECK_OTP}`, payload)
  }

  tokenDecoder(token: any) {
    try {
      let isTokenAvailable = localStorage.getItem('token')
      if(!isTokenAvailable) {
        let decodeData: any = jwt_decode(token);
        this.userId = decodeData.id;
        this.userName = decodeData.name;
        this.userEmail = decodeData.email;
        localStorage.setItem('token', token);
      }else {
        let decodeData: any = jwt_decode(isTokenAvailable);
        this.userId = decodeData.id;
        this.userName = decodeData.name;
        this.userEmail = decodeData.email;
      }
    } catch (Error) {
      return token;
    }
  }

}
