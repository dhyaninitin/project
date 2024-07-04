import { Routes } from '@angular/router';

import { CarsDirectDetailComponent } from './detail/detail.component';
import { CarsDirectComponent } from './cars-direct.component';

export const CarsDirectRoutes: Routes = [
  {
    path: '',
    component: CarsDirectComponent,
  },
  {
    path: ':id',
    component: CarsDirectDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
