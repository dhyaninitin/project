import { Routes } from '@angular/router';

import { UsersDetailComponent } from './detail/detail.component';
import { UsersComponent } from './users.component';

export const UsersRoutes: Routes = [
  {
    path: '',
    component: UsersComponent,
  },
  {
    path: ':id',
    component: UsersDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
