import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConciergeUserSettingsComponent } from './concierge-user-settings/concierge-user-settings.component';

const routes: Routes = [
  {
    path: '',
    component: ConciergeUserSettingsComponent
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConciergeUserSettingsRoutingModule { }
