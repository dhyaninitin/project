import { Routes } from '@angular/router';
import { WorkflowDetailComponent } from './detail/detail.component';
import { WorkflowsComponent } from './workflows.component';

export const WorkflowRoutes: Routes = [
    {
        path: '',
        component: WorkflowsComponent
    },
    {
        path: 'create',
        component: WorkflowDetailComponent,
        data: { title: 'Create', breadcrumb: 'CREATE' },
    },
    {
        path: ':id',
        component: WorkflowDetailComponent,
        data: { title: 'Detail', breadcrumb: 'DETAIL' },
    }
]