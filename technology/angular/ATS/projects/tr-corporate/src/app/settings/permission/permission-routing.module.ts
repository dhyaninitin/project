import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MFilterComponent } from './m-filter/m-filter.component';
import { UserManageComponent } from './user-manage/user-manage.component';

const routes: Routes = [
  {
    path: 'users',
    component: UserManageComponent
  },
 
  {
    path: 'filter',
    component: MFilterComponent
  },
 
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users'
  },
  {
    path: '**',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PermissionRoutingModule { }
