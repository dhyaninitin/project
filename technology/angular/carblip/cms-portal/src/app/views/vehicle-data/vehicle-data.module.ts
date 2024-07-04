import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleDataComponent } from './vehicle-data.component';
import { RouterModule } from '@angular/router';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { VehicleDataRoutes } from '../vehicle-data/vehicle-data.routing';
import { YearTableComponent } from './year-table/year-table.component';
import { BrandTableComponent } from './brand-table/brand-table.component';
import { ModelTableComponent } from './model-table/model-table.component';
import { TrimTableComponent } from './trim-table/trim-table.component';
import { ColorTableComponent } from './color-table/color-table.component';
import { EditModalComponent } from './edit-modal/edit-modal.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { OptionTableComponent } from './option-table/option-table.component';

@NgModule({
  declarations: [
    VehicleDataComponent,
    YearTableComponent,
    BrandTableComponent,
    ModelTableComponent,
    TrimTableComponent,
    ColorTableComponent,
    EditModalComponent,
    OptionTableComponent,
  ],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    PageLayoutModule,
    BreadcrumbsModule,
    RouterModule.forChild(VehicleDataRoutes),
    MatSelectInfiniteScrollModule,
    ImageCropperModule
  ],
})
export class VehicleDataModule { }
