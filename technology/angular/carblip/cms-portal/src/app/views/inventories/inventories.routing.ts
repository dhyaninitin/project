import { Routes } from '@angular/router';

import { InventoriesDetailComponent } from './detail/detail.component';
import { InventoriesComponent } from './inventories.component';

export const InventoriesRoutes: Routes = [
  {
    path: '',
    component: InventoriesComponent,
  },
  {
    path: ':id',
    component: InventoriesDetailComponent,
    data: { title: 'Detail', breadcrumb: 'DETAIL' },
  },
];
