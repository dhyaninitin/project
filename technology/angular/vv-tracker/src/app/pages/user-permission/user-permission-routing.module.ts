import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserPermissionComponent } from './user-permission.component';
import { ChildGuard } from '../shared/guards/child.guard';

const routes: Routes = [
  {
    path: '',
    component: UserPermissionComponent,
    canActivate: [ChildGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserPermissionRoutingModule { }
