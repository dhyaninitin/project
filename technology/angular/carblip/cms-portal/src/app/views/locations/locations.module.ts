import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { LocationService } from 'app/shared/services/apis/locations.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { LocationEffects } from 'app/store/locations/locations.effects';
import { store } from 'app/store/locations/locations.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { LocationsComponent } from './locations.component';
import { LocationsRoutes } from './locations.routing';
import { LocationsEditModalComponent } from './table/edit-modal/edit-modal.component';
import { LocationsTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(LocationsRoutes),

    StoreModule.forFeature(store.name, store.locationsReducer),
    EffectsModule.forFeature([LocationEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    LocationsComponent,
    LocationsTableComponent,
    LocationsEditModalComponent,
  ],
  providers: [LocationService],
  entryComponents: [LocationsEditModalComponent],
})
export class LocationsModule {}
