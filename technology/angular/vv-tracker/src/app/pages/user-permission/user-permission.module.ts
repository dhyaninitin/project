import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserPermissionRoutingModule } from './user-permission-routing.module';
import { UserPermissionComponent } from './user-permission.component';
import { MaterialModule } from '../shared/material/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PageLayoutModule } from "../../../@vex/components/page-layout/page-layout.module";
import { AddUserPermissionComponent } from './add-user-permission/add-user-permission.component';


@NgModule({
    declarations: [
        UserPermissionComponent,
        AddUserPermissionComponent
    ],
    imports: [
        CommonModule,
        UserPermissionRoutingModule,
        MaterialModule,
        ReactiveFormsModule,
        PageLayoutModule
    ]
})
export class UserPermissionModule { }
