import { Routes } from '@angular/router';

import { RequestsDetailComponent } from './detail/detail.component';
import { RequestsComponent } from './requests.component';

export const RequestsRoutes: Routes = [
  {
    path: '',
    component: RequestsComponent,
  },
  {
    path: ':id',
    component: RequestsDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
