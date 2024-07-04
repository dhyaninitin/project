import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsComponent } from './vendors.component';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { VendorsRoutes } from './vendors.routing';
import { VendorsTableComponent } from './table/table.component';
import { VendorsService } from 'app/shared/services/apis/vendors.service';
import { VendorsDetailComponent } from './detail/detail.component';
import { UserEffects } from 'app/store/users/users.effects';
import { store } from 'app/store/users/users.index';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';

@NgModule({
  declarations: [VendorsComponent,VendorsTableComponent, VendorsDetailComponent],
  imports: [
    CommonModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(VendorsRoutes),
    StoreModule.forFeature(store.name, store.usersReducer),
    EffectsModule.forFeature([UserEffects]),
    PageLayoutModule,
    BreadcrumbsModule
  ],
  providers:[VendorsService],
  entryComponents:[]
})
export class VendorsModule { }
