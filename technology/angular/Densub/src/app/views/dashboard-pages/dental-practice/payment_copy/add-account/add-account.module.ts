import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../../shared-ui/shared-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { AddAccountRoutingModule } from './add-account-routing.module';
import { AddAccountComponent } from './add-account.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    AddAccountRoutingModule
  ],
  declarations: [AddAccountComponent],
  providers: []
})
export class AddAccountModule { }
