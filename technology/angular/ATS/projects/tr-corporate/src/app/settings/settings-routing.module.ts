import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';
import { SettingsSideMenuComponent } from './settings-side-menu/settings-side-menu.component';
import { SettingsComponent } from './settings.component';
import { GenericGuardGuard } from '@tr/src/app/utility/services/routeGuards/generic-guard.guard';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        component: SettingsMenuComponent,
        canActivate: [GenericGuardGuard]
      },
      {
        path: 'settings-side-menu',
        component: SettingsSideMenuComponent
      },
      {
        path: 'permission',
        loadChildren: () => import('./permission/permission.module').then(m => m.PermissionModule),
        canActivate: [GenericGuardGuard]
      },
     
      {
        path: 'offer',
        loadChildren: () => import('./offer/offer.module').then(m => m.OfferModule),
        canActivate: [GenericGuardGuard]

      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
