import { Routes } from '@angular/router';

import { PendingChangesGuard } from 'app/shared/services/pending-changes.guard';
import { QuotesEditComponent } from './edit/edit.component';
import { QuotesComponent } from './quotes.component';

export const QuotesRoutes: Routes = [
  {
    path: '',
    component: QuotesComponent,
  },
  {
    path: ':requestId/add',
    component: QuotesEditComponent,
    canDeactivate: [PendingChangesGuard],
    data: { title: 'Add', breadcrumb: 'ADD' },
  },
  {
    path: ':id/edit',
    component: QuotesEditComponent,
    canDeactivate: [PendingChangesGuard],
    data: { title: 'Edit', breadcrumb: 'EDIT' },
  },
];
