import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { VexModule } from "../@vex/vex.module";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { CustomLayoutModule } from "./custom-layout/custom-layout.module";
import { SharedModule } from "./pages/shared/shared.module";
import { HttpResponseInterceptor } from "./pages/shared/interceptor/http-response.interceptor";
import { NgxSpinnerModule } from "ngx-spinner";
import { InfiniteScrollModule } from "ngx-infinite-scroll";


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    NgxSpinnerModule,
    // Vex
    VexModule,
    CustomLayoutModule,
    InfiniteScrollModule
  ],
  exports: [NgxSpinnerModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpResponseInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
