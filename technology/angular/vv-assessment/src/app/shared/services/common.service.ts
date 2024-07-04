import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  appURL = environment.apiUrl;
  helper = new JwtHelperService();
  constructor(private http: HttpClient) { }

  getUserDetails() {
    let token: any = localStorage.getItem('token')
    let decodedToken: any = this.decodeToken(token);
    if (decodedToken) {
      return {
        userId: decodedToken?.userId,
      };
    } else {
      return { userId: "" };
    }
  }

  decodeToken(token: string): { [key: string]: any } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  checkTokenExpirationDate(token: any): boolean {
    const decodedToken = this.helper.decodeToken(token);
    if (decodedToken.exp === undefined) {
      return false;
    }
    const date = new Date(0);
    date.setUTCSeconds(decodedToken.exp);
    if (date > new Date()) {
      return true;
    } else {
      return false;
    }
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('currentPage');
    localStorage.removeItem('year');
    localStorage.removeItem('collegeName');
    localStorage.removeItem('collegeCode');
  }

}
