import { Routes } from '@angular/router';

import { PortalUsersComponent } from './portalusers.component';
import { PortalUsersDetailComponent } from './detail/detail.component';

export const PortalUsersRoutes: Routes = [
  {
    path: '',
    component: PortalUsersComponent,
  },
  {
    path: ':id',
    component: PortalUsersDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
