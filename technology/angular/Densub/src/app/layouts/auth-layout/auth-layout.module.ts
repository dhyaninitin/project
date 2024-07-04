import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule, BsDropdownModule } from 'ngx-bootstrap';
import { SharedUiModule } from '../../shared-ui/shared-ui.module';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from '../../shared-ui/guard/auth.guard';
import { AuthLayoutComponent } from './auth-layout.component';
import { AuthLayoutRoutingModule } from './auth-layout-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    AuthLayoutRoutingModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
  ],
  declarations: [AuthLayoutComponent],
  providers: [AuthGuard]
})
export class AuthLayoutModule { }
