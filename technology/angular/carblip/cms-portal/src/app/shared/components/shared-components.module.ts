import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedDirectivesModule } from '../directives/shared-directives.module';
import { SharedPipesModule } from '../pipes/shared-pipes.module';
// import { SearchModule } from '../search/search.module';
import { SharedMaterialModule } from '../shared-material.module';

// ONLY REQUIRED FOR **SIDE** NAVIGATION LAYOUT
import { HeaderSideComponent } from './header-side/header-side.component';
import { SidebarSideComponent } from './sidebar-side/sidebar-side.component';

// ONLY REQUIRED FOR **TOP** NAVIGATION LAYOUT
import { HeaderTopComponent } from './header-top/header-top.component';
import { SidebarTopComponent } from './sidebar-top/sidebar-top.component';

// ONLY FOR DEMO
import { CustomizerComponent } from './customizer/customizer.component';

// ALWAYS REQUIRED
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { AppComfirmComponent } from '../services/app-confirm/app-confirm.component';
import { AppLoaderComponent } from '../services/app-loader/app-loader.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { BottomSheetShareComponent } from './bottom-sheet-share/bottom-sheet-share.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ButtonLoadingComponent } from './button-loading/button-loading.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarFromToComponent } from './calendar-from-to/calendar-from-to.component';
import { DealerContactModalComponent } from './dealer-contact-modal/dealer-contact-modal.component';
import { DealersModalComponent } from './dealer-modal/dealer-modal.component';
import {
  EgretSidebarComponent,
  EgretSidebarTogglerDirective,
} from './egret-sidebar/egret-sidebar.component';
import { EgretExampleViewerTemplateComponent } from './example-viewer-template/example-viewer-template.component';
import { EgretExampleViewerComponent } from './example-viewer/example-viewer.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { PrintLayoutComponent } from './layouts/print-layout/print-layout.component';
import { MatCardItemComponent } from './mat-card-item/item.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { VendorContactModalComponent } from './vendor-contact-modal/vendor-contact-modal.component';
import { VendorsEditComponent } from 'app/views/vendors/edit/edit.component';
import { PurchaseOrderModalComponent } from './purchase-order-modal/purchase-order-modal.component';
import { NgxMaskModule } from 'ngx-mask';
import { LayoutModule } from '@vex/layout/layout.module';
import { SidenavModule } from '@vex/layout/sidenav/sidenav.module';
import { ToolbarModule } from '@vex/layout/toolbar/toolbar.module';
import { FooterModule } from '@vex/layout/footer/footer.module';
import { SidebarModule } from '@vex/components/sidebar/sidebar.module';
import { QuickpanelModule } from '@vex/layout/quickpanel/quickpanel.module';
import { SearchModule } from '@vex/components/search/search.module';
import { ConfigPanelModule } from '@vex/components/config-panel/config-panel.module';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';

const components = [
  HeaderTopComponent,
  SidebarTopComponent,
  SidenavComponent,
  CalendarComponent,
  CalendarFromToComponent,
  NotificationsComponent,
  SidebarSideComponent,
  HeaderSideComponent,
  AdminLayoutComponent,
  AuthLayoutComponent,
  PrintLayoutComponent,
  BreadcrumbComponent,
  AppComfirmComponent,
  AppLoaderComponent,
  CustomizerComponent,
  ButtonLoadingComponent,
  BackButtonComponent,
  EgretSidebarComponent,
  EgretSidebarTogglerDirective,
  BottomSheetShareComponent,
  EgretExampleViewerComponent,
  EgretExampleViewerTemplateComponent,
  MatCardItemComponent,
  DealersModalComponent,
  DealerContactModalComponent,
  VendorContactModalComponent,
  VendorsEditComponent,
  PurchaseOrderModalComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    FlexLayoutModule,
    PerfectScrollbarModule,
    // SearchModule,
    SharedPipesModule,
    SharedDirectivesModule,
    SharedMaterialModule,
    SatDatepickerModule,
    SatNativeDateModule,
    NgxMaskModule.forChild(),
    LayoutModule,
    SidenavModule,
    ToolbarModule,
    FooterModule,
    SidebarModule,
    QuickpanelModule,
    ConfigPanelModule,
    SearchModule,
    MatSelectInfiniteScrollModule
  ],
  declarations: components,
  entryComponents: [
    AppComfirmComponent,
    AppLoaderComponent,
    BottomSheetShareComponent,
    DealersModalComponent,
    DealerContactModalComponent,
    VendorContactModalComponent,
    VendorsEditComponent,
    PurchaseOrderModalComponent,
  ],
  exports: [
    TranslateModule,
    SatDatepickerModule,
    SatNativeDateModule,
    ...components,
  ],
})
export class SharedComponentsModule {}
