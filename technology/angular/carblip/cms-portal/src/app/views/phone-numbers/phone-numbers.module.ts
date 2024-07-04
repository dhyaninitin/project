import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhoneNumbersRoutingModule } from './phone-numbers-routing.module';
import { PhoneNumbersComponent } from './phone-numbers.component';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { RequestEffects } from 'app/store/requests/requests.effects';
import { store } from 'app/store/requests/requests.index';
import { PhoneNumbersTableComponent } from './table/table.component';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { MatDialogModule } from '@angular/material/dialog';
import { EditModalComponent } from './edit-modal/edit-modal.component';

@NgModule({
  declarations: [
    PhoneNumbersComponent,
    PhoneNumbersTableComponent,
    EditModalComponent,
  ],
  imports: [
    CommonModule,
    PhoneNumbersRoutingModule,
    SharedMaterialModule,
    SharedModule,
    StoreModule.forFeature(store.name, store.requestsReducer),
    EffectsModule.forFeature([RequestEffects]),
    PageLayoutModule,
    BreadcrumbsModule,
    MatDialogModule
  ]
})
export class PhoneNumbersModule { }
