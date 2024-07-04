import { Injectable } from '@angular/core';
import { AuthServiceImpl } from 'app/shared/states/auth/auth.service';
import { environment as env } from 'environments/environment';
import { SegmentService } from 'ngx-segment-analytics';

@Injectable()
export class SegmentioService {
  constructor(
    private segment: SegmentService,
    private authService: AuthServiceImpl
  ) {}

  track(eventName = '', propertyName = '', screenName = '', actionName = '') {
    if (env.enableTracking) {
      this.segment.track(
        actionName,
        {
          AppAction: eventName,
          Item: propertyName,
          Screen: screenName,
          LoggedIn: this.authService.isLoggedIn(),
          Timestamp: Date.now(),
        },
        {
          integrations: {
            Amplitude: true,
            'Facebook Pixel': true,
            'Google Analytics': true,
            Mixpanel: false,
            AppsFlyer: false,
          },
        }
      );
    }
  }

  page(eventName = '', propertyName = '', screenName = '', actionName = '') {
    if (env.enableTracking) {
      this.segment.page(
        '',
        screenName,
        {
          AppAction: eventName,
          Item: propertyName,
          Screen: screenName,
          LoggedIn: this.authService.isLoggedIn(),
          Timestamp: Date.now(),
        },
        {
          integrations: {
            Amplitude: true,
            'Facebook Pixel': true,
            'Google Analytics': true,
            Mixpanel: false,
            AppsFlyer: false,
          },
        }
      );
    }
  }

  identify(userId = '', eventName = '', propertyName = '', screenName = '') {
    if (env.enableTracking) {
      this.segment.identify(
        userId,
        {
          AppAction: eventName,
          Item: propertyName,
          Screen: screenName,
          Timestamp: Date.now(),
        },
        {
          integrations: {
            Amplitude: true,
            'Facebook Pixel': true,
            'Google Analytics': true,
            Mixpanel: false,
            AppsFlyer: false,
          },
        }
      );
    }
  }
}
