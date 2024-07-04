import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { PrivacyPolicyRoutingModule } from './privacy-policy-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PrivacyPolicyRoutingModule
  ],
  declarations: [PrivacyPolicyComponent],
  providers: []
})
export class PrivacyPolicyModule { }
