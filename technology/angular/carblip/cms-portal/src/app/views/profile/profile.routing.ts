import { Routes } from '@angular/router';
import { ProfileOverviewEditComponent } from './overview-edit/overview-edit.component';
import { ProfileOverviewComponent } from './overview/overview.component';
import { ProfileComponent } from './profile.component';

export const ProfileRoutes: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: 'overview',
        component: ProfileOverviewComponent,
        data: { title: 'Overview', breadcrumb: 'Overview' },
      }
    ],
  },
];
