import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { PortalUserService } from 'app/shared/services/apis/portalusers.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { PortalUserEffects } from 'app/store/portalusers/portalusers.effects';
import { store } from 'app/store/portalusers/portalusers.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { PortalUsersComponent } from './portalusers.component';
import { PortalUsersRoutes } from './portalusers.routing';
import { PortalUsersDetailComponent } from './detail/detail.component';
import { PortalUsersEditModalComponent } from './table/edit-modal/edit-modal.component';
import { PortalUsersTableComponent } from './table/table.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(PortalUsersRoutes),

    StoreModule.forFeature(store.name, store.portalUsersReducer),
    EffectsModule.forFeature([PortalUserEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    PortalUsersComponent,
    PortalUsersTableComponent,
    PortalUsersEditModalComponent,
    PortalUsersDetailComponent,
  ],
  providers: [PortalUserService],
  entryComponents: [PortalUsersEditModalComponent],
})
export class PortalUsersModule {}
