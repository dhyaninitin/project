import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { RecoverPasswordRoutingModule } from './recover-password-routing.module';
import { RecoverPasswordComponent } from './recover-password.component';

@NgModule({
  imports: [
    CommonModule,
    RecoverPasswordRoutingModule,
    FormsModule,
    SharedUiModule
  ],
  declarations: [RecoverPasswordComponent],
  providers: []
})
export class RecoverPasswordModule { }
