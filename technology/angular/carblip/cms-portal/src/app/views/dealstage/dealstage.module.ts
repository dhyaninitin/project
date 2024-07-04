import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { DealstageEffects } from 'app/store/dealstage/dealstage.effects';
import { store } from 'app/store/dealstage/dealstage.index';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { DealstageComponent } from './dealstage.component';
import { DealstageRoutes } from './dealstage.routing';
import { DealstageTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(DealstageRoutes),
    StoreModule.forFeature(store.name, store.dealstageReducer),
    EffectsModule.forFeature([DealstageEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [DealstageComponent, DealstageTableComponent],
  providers: [DealStageService],
  entryComponents: [],
})
export class DealstageModule {}
