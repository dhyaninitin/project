import { HttpClient, HttpParams } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

interface MailChimpResponse {
  result: string;
  msg: string;
}

import {
  MAILCHIMP_SUBSCRIBE_PARAM,
  MAILCHIMP_SUBSCRIBE_URL,
} from 'app/core/constant';

@Injectable()
export class MailchimpService {
  constructor(private http: HttpClient) {}

  sendSubscriptionRequest(params: any): Observable<any> {
    const queryParam = new HttpParams()
      .set('EMAIL', params['email'])
      .set('u', MAILCHIMP_SUBSCRIBE_PARAM.u)
      .set('id', MAILCHIMP_SUBSCRIBE_PARAM.id)
      .set(MAILCHIMP_SUBSCRIBE_PARAM.hidden, '');

    const mailChimpUrl = MAILCHIMP_SUBSCRIBE_URL + '?' + queryParam.toString();

    return this.http.jsonp<MailChimpResponse>(mailChimpUrl, 'c');
  }
}
