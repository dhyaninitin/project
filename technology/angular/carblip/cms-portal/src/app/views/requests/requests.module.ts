import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { ExportService } from 'app/shared/services/apis/export.service';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { RequestService } from 'app/shared/services/apis/requests.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { RequestEffects } from 'app/store/requests/requests.effects';
import { store } from 'app/store/requests/requests.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { RequestsDetailComponent } from './detail/detail.component';
import { RequestsComponent } from './requests.component';
import { RequestsRoutes } from './requests.routing';
import { RequestsTableComponent } from './table/table.component';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { RequestBoardViewComponent } from './request-board-view/request-board-view.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(RequestsRoutes),

    StoreModule.forFeature(store.name, store.requestsReducer),
    EffectsModule.forFeature([RequestEffects]),
    PageLayoutModule,
    BreadcrumbsModule,
    MatSelectInfiniteScrollModule,
    DragDropModule
  ],
  declarations: [
    RequestsComponent,
    RequestsTableComponent,
    RequestsDetailComponent,
    RequestBoardViewComponent,
  ],
  providers: [
    RequestService,
    ExportService,
    VBrandService,
    VModelService,
    VehicleService,
    QuoteService,
  ],
  entryComponents: [],
})
export class RequestsModule {}
