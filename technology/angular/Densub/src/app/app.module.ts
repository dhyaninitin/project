import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { UiModule } from './layouts/home-layout/ui.module';
import { AuthGuard } from './shared-ui/guard/auth.guard';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { AngularFirestore } from '@angular/fire/firestore';
import { RouteGuard } from './shared-ui/guard/route.guard';
// import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
// import { PickerModule } from '@ctrl/ngx-emoji-mart';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  declarations: [
    AppComponent,
    // JobListingComponent,
    // JobPostListingComponent,
    // JobAComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    UiModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    NgxMaterialTimepickerModule
    // EmojiModule,
    // NgxDaterangepickerMd.forRoot()
  ],
  providers: [AuthGuard, RouteGuard, AngularFirestore,  {
    provide: LocationStrategy,
    useClass: HashLocationStrategy,
  },
  // PickerModule,
  // EmojiModule
],
  bootstrap: [AppComponent]
})
export class AppModule {
}
