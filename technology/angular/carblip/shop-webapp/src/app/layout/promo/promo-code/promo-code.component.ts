import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, InjectionToken, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-promo-code',
  templateUrl: './promo-code.component.html',
  styleUrls: ['./promo-code.component.scss']
})
export class PromoCodeComponent implements OnInit {


  private readonly documentIsAccessible: boolean;

  constructor(
    @Inject( DOCUMENT ) private document: any,
    @Inject( PLATFORM_ID ) private platformId: InjectionToken<Object>,
    private route: Router
  ) {
    this.documentIsAccessible = isPlatformBrowser( this.platformId );
    let url = route.url;
    url = url.substring(1,url.length);
    if(url.length > 0 && url !== '' && url !== "'" && url !== "''" ){
      this.set('promoCode', url, 5, '','' , true, 'Strict');
    }
  }

  set(
    name: string,
    value: string,
    expires?: number | Date,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: 'Lax' | 'Strict'
  ): void {
    if ( !this.documentIsAccessible ) {
      return;
    }

    let cookieString: string = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';';

    if ( expires ) {
      if ( typeof expires === 'number' ) {
        const dateExpires: Date = new Date( new Date().getTime() + expires * 1000 * 60 * 60 * 24 );

        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + expires.toUTCString() + ';';
      }
    }

    if ( path ) {
      cookieString += 'path=' + path + ';';
    }

    if ( domain ) {
      cookieString += 'domain=' + domain + ';';
    }

    if ( secure ) {
      cookieString += 'secure;';
    }

    if ( sameSite ) {
      cookieString += 'sameSite=' + sameSite + ';';
    }

    this.document.cookie = cookieString;
  }

  ngOnInit() {
    this.route.navigateByUrl('/find-my-car');
  }

}
