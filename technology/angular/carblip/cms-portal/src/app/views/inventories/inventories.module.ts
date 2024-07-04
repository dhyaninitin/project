import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { InventoryService } from 'app/shared/services/apis/inventories.service';
import { MDealerService } from 'app/shared/services/apis/mdealer.service';
import { MMakeService } from 'app/shared/services/apis/mmake.service';
import { MModelService } from 'app/shared/services/apis/mmodel.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { InventoryEffects } from 'app/store/inventories/inventories.effects';
import { store } from 'app/store/inventories/inventories.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { InventoriesDetailComponent } from './detail/detail.component';
import { InventoriesComponent } from './inventories.component';
import { InventoriesRoutes } from './inventories.routing';
import { InventoriesTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(InventoriesRoutes),

    StoreModule.forFeature(store.name, store.inventoriesReducer),
    EffectsModule.forFeature([InventoryEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    InventoriesComponent,
    InventoriesTableComponent,
    InventoriesDetailComponent,
  ],
  providers: [InventoryService, MDealerService, MMakeService, MModelService],
})
export class InventoriesModule {}
