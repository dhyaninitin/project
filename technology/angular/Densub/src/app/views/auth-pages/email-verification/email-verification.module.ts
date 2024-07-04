import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailVerificationRoutingModule } from './email-verification-routing.module';
import { EmailVerificationComponent } from './email-verification.component';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';


@NgModule({
  declarations: [EmailVerificationComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    EmailVerificationRoutingModule
  ]
})
export class EmailVerificationModule { }
