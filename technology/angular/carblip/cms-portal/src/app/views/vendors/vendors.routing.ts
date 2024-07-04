import { Routes } from '@angular/router';
import { VendorsDetailComponent } from './detail/detail.component';

import { VendorsComponent } from './vendors.component';



export const VendorsRoutes: Routes = [
  {
    path: '',
    component: VendorsComponent,
  },
  {
    path: ':id',
    component: VendorsDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
