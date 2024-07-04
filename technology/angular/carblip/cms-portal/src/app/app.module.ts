import { ErrorHandler, NgModule } from '@angular/core';
// import { GestureConfig } from '@angular/material';
import {
  BrowserModule,
  HAMMER_GESTURE_CONFIG,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import {
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
  PerfectScrollbarModule,
} from 'ngx-perfect-scrollbar';

import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './shared/inmemory-db/inmemory-db.service';

import { AppComponent } from './app.component';
import { rootRouterConfig } from './app.routing';
import { SharedModule } from './shared/shared.module';

import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ErrorHandlerService } from './shared/services/error-handler.service';

// import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TokenInterceptor } from 'app/shared/services/token.interceptor';
import { AppStoreModule } from './store/store.module';

// Import your library
import { NgxPermissionsModule } from 'ngx-permissions';
import { VexModule } from '@vex/vex.module';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';


// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  imports: [
    // AngularFontAwesomeModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    PerfectScrollbarModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    InMemoryWebApiModule.forRoot(InMemoryDataService, {
      passThruUnknownUrl: true,
    }),
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    AppStoreModule,
    NgxPermissionsModule.forRoot(),

    // Vex
    VexModule,

    MatSelectInfiniteScrollModule
  ],
  declarations: [AppComponent],
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    // { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
