import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { CarsDirectService } from 'app/shared/services/apis/cars-direct.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { RequestEffects } from 'app/store/requests/requests.effects';
import { store } from 'app/store/requests/requests.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { CarsDirectComponent } from './cars-direct.component';
import { CarsDirectRoutes } from './cars-direct.routing';
import { CarsDirectDetailComponent } from './detail/detail.component';
import { CarsDirectTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(CarsDirectRoutes),

    StoreModule.forFeature(store.name, store.requestsReducer),
    EffectsModule.forFeature([RequestEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    CarsDirectComponent,
    CarsDirectTableComponent,
    CarsDirectDetailComponent,
  ],
  providers: [
    CarsDirectService,
  
  ],
  entryComponents: [],
})
export class CarsDirectModule {}
