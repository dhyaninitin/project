import { Routes } from '@angular/router';

import { DealersComponent } from './dealers.component';
import { DealersDetailComponent } from './detail/detail.component';

export const DealersRoutes: Routes = [
  {
    path: '',
    component: DealersComponent,
  },
  {
    path: ':id',
    component: DealersDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
