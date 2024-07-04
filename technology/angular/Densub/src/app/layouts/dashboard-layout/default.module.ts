import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultRoutingModule } from './default-routing.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SharedUiModule } from '../../shared-ui/shared-ui.module';
import { DefaultLayoutComponent } from './default-layout.component';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";

const APP_CONTAINERS = [DefaultLayoutComponent];
import {
  AppAsideModule,
  // AppBreadcrumbModule,
  AppHeaderModule,
  AppFooterModule,
  AppSidebarModule
} from "@coreui/angular";
import { AuthGuard } from '../../shared-ui/guard/auth.guard';


@NgModule({
  imports: [
    CommonModule,
    AppAsideModule,
    AppHeaderModule,
    AppFooterModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    // AppBreadcrumbModule.forRoot(),
    DefaultRoutingModule,
    BsDropdownModule.forRoot(),
    SharedUiModule
  ],
  declarations: [DefaultLayoutComponent, ...APP_CONTAINERS,],
  providers: [AuthGuard]
})
export class DefaultModule {
}
