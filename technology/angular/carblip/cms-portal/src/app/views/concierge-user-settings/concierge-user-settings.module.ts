import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConciergeUserSettingsRoutingModule } from './concierge-user-settings-routing.module';
import { ConciergeUserSettingsComponent } from './concierge-user-settings/concierge-user-settings.component';
import { SharedModule } from 'app/shared/shared.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';


@NgModule({
  declarations: [
    ConciergeUserSettingsComponent
  ],
  imports: [
    CommonModule,
    ConciergeUserSettingsRoutingModule,
    SharedModule,
    SharedMaterialModule,
    PageLayoutModule,
    BreadcrumbsModule,
    NgOtpInputModule,
    MatSelectInfiniteScrollModule
  ]
})
export class ConciergeUserSettingsModule { }
