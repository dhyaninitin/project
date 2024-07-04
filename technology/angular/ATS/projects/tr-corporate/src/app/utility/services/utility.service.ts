import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  
  constructor() { }
  urlReplace(url: string, ...values: string[]) {
    let newUrl = url.split('/');
    return newUrl.map((e, i) => {
      return e.includes('$') ? values.shift() : e;

    }).join('/')
  }

  isMobile(strict: boolean = false) {
    const isMobileScreen = window.matchMedia("only screen and (max-width: 760px)").matches;
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isMobileTouch = 'ontouchstart' in document.documentElement;
    return strict ? (isMobileScreen && isMobileAgent && isMobileTouch) : (isMobileScreen || isMobileAgent || isMobileTouch);
  }
}
