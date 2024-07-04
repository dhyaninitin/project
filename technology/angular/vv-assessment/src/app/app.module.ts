import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthenticationInterceptor } from './shared/interceptors/authentication.interceptor';
import { DeleteDialogComponent } from './shared/components/delete-dialog/delete-dialog.component';
import { MaterialModule } from './shared/material/material.module';
import { APP_BASE_HREF } from '@angular/common';
import { SessionExpiredComponent } from './shared/components/session-expired/session-expired.component';
import { LoaderInterceptor } from './shared/interceptors/loader.interceptor';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
    DeleteDialogComponent,
    SessionExpiredComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule.forRoot({ type: 'ball-running-dots'}),
    MaterialModule
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthenticationInterceptor,
    multi: true,
  },
  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
