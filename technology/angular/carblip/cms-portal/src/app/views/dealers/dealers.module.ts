import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { DealerService } from 'app/shared/services/apis/dealer.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { UserEffects } from 'app/store/users/users.effects';
import { store } from 'app/store/users/users.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { DealersComponent } from './dealers.component';
import { DealersRoutes } from './dealers.routing';
import { DealersDetailComponent } from './detail/detail.component';
import { DealersTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(DealersRoutes),

    StoreModule.forFeature(store.name, store.usersReducer),
    EffectsModule.forFeature([UserEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    DealersComponent,
    DealersTableComponent,
    DealersDetailComponent,
  ],
  providers: [DealerService],
  entryComponents: [],
})
export class DealersModule {}
