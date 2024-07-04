import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import { SettingsSideMenuComponent } from './settings-side-menu/settings-side-menu.component';
import { CardModule, LayoutModule, MaterialModule } from '@tr';
import { SettingsRoutingModule } from './settings-routing.module';
import { RouterModule } from '@angular/router';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';

// Perfect Scrollbar
import {
  PerfectScrollbarModule,
  PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG,
} from 'ngx-perfect-scrollbar';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { LSkeys } from '../utility/configs/app.constants';
import { McCoreModule, TranslatePipe } from '@cloudtalentrecruit/ng-core';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true,
};

@NgModule({
  declarations: [
    SettingsComponent,
    SettingsMenuComponent,
    SettingsSideMenuComponent,
  ],
  imports: [
    CommonModule,
    McCoreModule,
    MaterialModule,
    CardModule,
    SettingsRoutingModule,
    PerfectScrollbarModule,
    LayoutModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class SettingsModule {}
