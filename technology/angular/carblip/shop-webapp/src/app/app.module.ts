import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap';

import { AppComponent } from 'app/app.component';
import { CoreModule } from 'app/core/core.module';
import { AppRoutingModule } from 'app/route/route.module';
import { SharedModule } from 'app/shared/shared.module';
import { environment } from 'environments/environment';
import { LayoutModule } from './layout/layout.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { SegmentModule } from 'ngx-segment-analytics';
import { ToastrModule } from 'ngx-toastr';

import { FormControlService } from 'app/shared/services/form-control.service';
import { CustomOverlayService } from './shared/services/custom-overlay.service';
import { ImageLoadService } from './shared/services/image-load.service';
import { MailchimpService } from './shared/services/mailchimp.service';
import { NotificationService } from './shared/services/notification.service';
import { QueryService } from './shared/services/query.service';
import { SegmentioService } from './shared/services/segmentio.service';

import * as Sentry from '@sentry/browser';

import { CookieService } from 'ngx-cookie-service';

Sentry.init(environment.name !== 'localhost' ? environment.sentry : {});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    Sentry.captureException(error.originalError || error);
    throw error;
  }
}

/**
 * this module should be kept as small as possible and shouldn't be modified
 * if you feel like you want to add something here, you should take a look into SharedModule or CoreModule
 */
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpClientJsonpModule,
    CoreModule,
    SharedModule,
    AppRoutingModule,
    ModalModule.forRoot(),
    LayoutModule,
    FormsModule,
    EffectsModule.forRoot([]),
    BrowserAnimationsModule,
    ToastrModule.forRoot(), // ToastrModule added
    SegmentModule.forRoot({
      apiKey: environment.segmentApiKey,
      debug: environment.debug,
      loadOnInitialization: true,
    }),
  ],
  providers: [
    // use hash location strategy or not based on env
    {
      provide: LocationStrategy,
      useClass: environment.hashLocationStrategy
        ? HashLocationStrategy
        : PathLocationStrategy,
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    NotificationService,
    ImageLoadService,
    FormControlService,
    MailchimpService,
    SegmentioService,
    QueryService,
    CustomOverlayService,
    CookieService 
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
