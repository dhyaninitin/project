import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  currentLoggedUserInfo: any = {};
  currentLoggedUserAccess: any = {};

  constructor() {
    this.getCurrentUser();
  }

  saveToken(token: string) {
    window.localStorage.setItem('jwtToken', token);
  }
  getToken(): string {
    return window.localStorage.getItem('jwtToken');
  }
  saveCurrentUser(userDetails) {
    window.localStorage.setItem('currentUser', userDetails);
  }
  getCurrentUser(): string {
    this.currentLoggedUserInfo = JSON.parse(window.localStorage.getItem('currentUser'));
    // console.log('222222222222222222', this.currentLoggedUserInfo);
    return JSON.parse(window.localStorage.getItem('currentUser'));
  }
  destroyToken() {
    window.localStorage.removeItem('jwtToken');
    window.localStorage.removeItem('username');
    window.localStorage.removeItem('currentUser');
    this.currentLoggedUserInfo = {};
  }
  saveUsername(username: string) {
    localStorage.setItem('username', username);
  }
  getUsername() {
    return localStorage.getItem('username');
  }

  getAccess(page?: any) {
    let found = [];
    if (this.currentLoggedUserInfo && this.currentLoggedUserInfo.accessLevel.length) {
      const levels = this.currentLoggedUserInfo.accessLevel[0];
      found = levels.levelJson.filter( (levels) => levels.menu === page);
      return found;
    } else {
      return found;
    }
  }

}
