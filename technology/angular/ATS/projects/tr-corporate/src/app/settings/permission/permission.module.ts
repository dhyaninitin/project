import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserManageComponent } from './user-manage/user-manage.component';

import { LayoutModule, MaterialModule } from '@tr';
import { MFilterComponent } from './m-filter/m-filter.component';
import { PermissionComponent } from './permission.component';
import { PermissionRoutingModule } from './permission-routing.module';


// Perfect Scrollbar
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { McCoreModule } from '@cloudtalentrecruit/ng-core';
  const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };

@NgModule({
  declarations: [
    UserManageComponent,
    MFilterComponent,
    PermissionComponent
  ],
  imports: [
    CommonModule,
    McCoreModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LayoutModule,
    PermissionRoutingModule,
    PerfectScrollbarModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  entryComponents: [
    MFilterComponent
  ]
})
export class PermissionModule { }
