import { Routes } from '@angular/router';

import { MDealersDetailComponent } from './detail/detail.component';
import { MDealersComponent } from './mdealers.component';

export const MDealersRoutes: Routes = [
  {
    path: '',
    component: MDealersComponent,
  },
  {
    path: ':id',
    component: MDealersDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
