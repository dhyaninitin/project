import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountSettingsRoutingModule } from './account-settings-routing.module';
import { AccountSettingsComponent } from './account-settings.component';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedUiModule,
    AccountSettingsRoutingModule
  ],
  declarations: [AccountSettingsComponent],
  providers: []
})
export class AccountSettingsModule { }
