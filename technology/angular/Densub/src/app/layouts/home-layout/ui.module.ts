import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiRoutingModule } from './ui-routing.module';
import { ModalModule, BsDropdownModule } from 'ngx-bootstrap';
import { SharedUiModule } from '../../shared-ui/shared-ui.module';
import { UiComponent } from './ui.component';
import { FormsModule } from '@angular/forms';
import { DefaultModule } from '../dashboard-layout/default.module';
import { AuthGuard } from '../../shared-ui/guard/auth.guard';
import { AuthLayoutModule } from '../auth-layout/auth-layout.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UiRoutingModule,
    SharedUiModule,
    DefaultModule,
    AuthLayoutModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
  ],
  declarations: [UiComponent],
  providers: [AuthGuard]
})
export class UiModule {
}
