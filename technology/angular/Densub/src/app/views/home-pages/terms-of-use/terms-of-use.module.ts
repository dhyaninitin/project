import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TermsOfUseRoutingModule } from './terms-of-use-routing.module';
import { TermsOfUseComponent } from './terms-of-use.component';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';


@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    TermsOfUseRoutingModule
  ],
  declarations: [TermsOfUseComponent]
})
export class TermsOfUseModule { }
