import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashabordComponent } from './dashabord.component';
import { StatsComponent } from './stats/stats.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CardModule, LayoutModule, MaterialModule } from '@tr';
import { ComponentsModule } from '@cloudtalentrecruit/ng-design';
import { McCoreModule } from '@cloudtalentrecruit/ng-core';
import { TrFeatureModule } from '@tr/src/app/tr-feature/tr-feature.module';
import { LstorageService } from '@tr/src/app/utility/services/lstorage.service';
import { LSkeys } from '../utility/configs/app.constants';

// Perfect Scrollbar
import {
  PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

@NgModule({
  declarations: [
    DashabordComponent,
    StatsComponent,
  ],
  imports: [
    CommonModule,
    McCoreModule,
    LayoutModule,
    ComponentsModule,
    MaterialModule,
    CardModule,
    TrFeatureModule,
    // McCardModule,
    DashboardRoutingModule,
    PerfectScrollbarModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class DashboardModule {
  constructor(
    private lsServ: LstorageService) {
    // const languageData = this.lsServ.getItem(LSkeys.LANGUAGE);
    // if (languageData) TranslatePipe.setLanguagePack(JSON.parse(languageData));
    // TranslatePipe.setUserLanguage("EN-US")
  }
}
