import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { admin_api_routes } from "../enums/route.enum";
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  adminId: any;
  firstName: any;
  email: string;
  role: any;

  constructor(private http: HttpClient) {}

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.LOGIN}`, payload);
  }

  sendOtpToUserEmail(email: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.SEND_OTP}`, {email})
  }

  checkOtp(payload: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.CHECK_OTP}`, payload)
  }

  forgetPassword(data: any): Observable<any> {
    return this.http.post<any>(`${admin_api_routes.FORGET_PASSWORD}`, data);
  }

  tokenDecoder(token: any) {
    try {
      let isTokenAvailable = localStorage.getItem("token");
      if (!isTokenAvailable) {
        let decodeData: any = jwt_decode(token);
        this.adminId = decodeData.id;
        this.firstName = decodeData.firstname;
        this.email = decodeData.email;
        this.role = decodeData.role;
        localStorage.setItem("token", token);
        return this.role;
      } else {
        let decodeData: any = jwt_decode(isTokenAvailable);
        this.adminId = decodeData.id;
        this.firstName = decodeData.firstname;
        this.email = decodeData.email;
        this.role = decodeData.role;
      }
    } catch (Error) {
      return token;
    }
  }
}
