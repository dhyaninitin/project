import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { DealstageRoutes } from './portal-deal-stage.routing';
import { PortalDealStageComponent } from './portal-deal-stage.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { store } from 'app/store/dealstage/dealstage.index';
import { DealstageEffects } from 'app/store/dealstage/dealstage.effects';
import { TableComponent } from './table/table.component';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { DealStageAddEditModalComponent } from './table/add-edit-modal/add-edit-modal.component';

@NgModule({
  declarations: [PortalDealStageComponent, TableComponent, DealStageAddEditModalComponent],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(DealstageRoutes),
    StoreModule.forFeature(store.name, store.dealstageReducer),
    EffectsModule.forFeature([DealstageEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  providers: [
    DealStageService
  ],
  entryComponents:[],
})
export class PortalDealStageModule {TableComponent }
