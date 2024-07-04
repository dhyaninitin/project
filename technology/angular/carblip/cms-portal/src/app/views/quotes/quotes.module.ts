import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { ExportService } from 'app/shared/services/apis/export.service';
import { QuoteService } from 'app/shared/services/apis/quotes.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { UserEffects } from 'app/store/users/users.effects';
import { store } from 'app/store/users/users.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { QuotesEditComponent } from './edit/edit.component';
import { QuotesComponent } from './quotes.component';
import { QuotesRoutes } from './quotes.routing';
import { QuotesTableComponent } from './table/table.component';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    PageLayoutModule,
    BreadcrumbsModule,
    MatSelectInfiniteScrollModule,
    RouterModule.forChild(QuotesRoutes),

    StoreModule.forFeature(store.name, store.usersReducer),
    EffectsModule.forFeature([UserEffects]),
  ],
  declarations: [QuotesComponent, QuotesTableComponent, QuotesEditComponent],
  providers: [QuoteService, ExportService, VBrandService, VModelService,DatePipe,TitleCasePipe],
  entryComponents: [],
})
export class QuotesModule {}
