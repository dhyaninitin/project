import { Routes } from '@angular/router';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { PrintLayoutComponent } from './shared/components/layouts/print-layout/print-layout.component';
import { AuthGuard } from './shared/services/auth/auth.guard';
import { VehicleDataComponent } from './views/vehicle-data/vehicle-data.component';

export const rootRouterConfig: Routes = [
  {
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'sessions',
        loadChildren: () => import('./views/sessions/sessions.module').then(x => x.SessionsModule),
        data: { title: '' },
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'contacts',
        loadChildren: () => import('./views/users/users.module').then(x => x.UsersModule),
        data: { title: 'Contacts', breadcrumb: 'CONTACTS' },
      },
      {
        path: 'locations',
        loadChildren: () => import('./views/locations/locations.module').then(x => x.LocationsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Locations',
          breadcrumb: 'LOCATIONS',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'dealstage',
        loadChildren: () => import('./views/dealstage/dealstage.module').then(x => x.DealstageModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'DealStage',
          breadcrumb: 'DEALSTAGE',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'phonenumbers',
        loadChildren: () => import('./views/phone-numbers/phone-numbers.module').then(x => x.PhoneNumbersModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Phone Numbers',
          breadcrumb: 'PHONENUMBERS',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'deals',
        loadChildren: () => import('./views/requests/requests.module').then(x => x.RequestsModule),
        data: { title: 'Deals', breadcrumb: 'DEALS' },
      },
      {
        path: 'inventories',
        loadChildren: () => import('./views/inventories/inventories.module').then(x => x.InventoriesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Inventories',
          breadcrumb: 'INVENTORY',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./views/dealers/dealers.module').then(x => x.DealersModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Suppliers',
          breadcrumb: 'SUPPLIERS',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'mdealers',
        loadChildren: () => import('./views/mdealers/mdealers.module').then(x => x.MDealersModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'mPortal Dealers',
          breadcrumb: 'MPORTALDEALERS',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'vendors',
        loadChildren: () => import('./views/vendors/vendors.module').then(x => x.VendorsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Vendors',
          breadcrumb: 'VENDORS',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'quotes',
        loadChildren: () => import('./views/quotes/quotes.module').then(x => x.QuotesModule),
        data: {
          title: 'Quotes',
          breadcrumb: 'QUOTES',
        },
      },
      {
        path: 'wholesalequote',
        loadChildren: () => import('./views/wholesale-quote/wholesale-quote.module').then(x => x.WholesaleQuoteModule),
        data: {
          title: 'WholesaleQuote',
          breadcrumb: 'WHOLESALE QUOTE',
        },
      },
      {
        path: 'purchaseorder',
        loadChildren: () => import('./views/purchase-order/purchase-order.module').then(x => x.PurchaseOrderModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Purchase Order',
          breadcrumb: 'PURCHASE ORDER',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'carsdirect',
        loadChildren: () => import('./views/cars-direct/cars-direct.module').then(x => x.CarsDirectModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'CB2',
          breadcrumb: 'CARSDIRECT',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'users',
        loadChildren: () => import('./views/portalusers/portalusers.module').then(x => x.PortalUsersModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Users',
          breadcrumb: 'USERS',
          permissions: {
            only: [
              'manage_portal',
              'manage_portal_local',
              'manage_portal_sales',
              'manage_portal_sales_local',
            ],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'profile',
        canDeactivate: [AuthGuard],
        loadChildren: () => import('./views/profile/profile.module').then(x => x.ProfileModule),
        data: { title: 'Profile', breadcrumb: 'PROFILE' },
      },
      {
        path: 'blocklist',
        loadChildren: () => import('./views/block-list/block-list.module').then(x => x.BlockListModule),
        canActivate: [NgxPermissionsGuard],
        data: { 
          title: 'blocklist', 
          breadcrumb: 'BLOCKLIST',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'reports',
        loadChildren: () => import('./views/reports/reports.module').then(x => x.ReportsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Reports',
          breadcrumb: 'REPORTS',
          permissions: {
            except: ['concierge'],
            redirectTo: '/sessions/404'
          },
        },
      },
      {
        path: 'clientfiles',
        loadChildren: () => import('./views/client-files/client-files.module').then(x => x.ClientFilesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Client Files',
          breadcrumb: 'CLIENT FILES',
        },
      },
      {
        path: 'workflows',
        loadChildren: () => import('./views/workflow/workflows.module').then(x => x.WorkflowModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Workflows',
          breadcrumb: 'WORKFLOWS',
          permissions: {
            only: ['superadmin', 'admin', 'manager'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'tasks',
        loadChildren: () => import('./views/tasks/tasks.module').then(x => x.TasksModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Tasks',
          breadcrumb: 'TASKS'
        },
      },
      {
        path: 'mDesk',
        loadChildren: () => import('./views/mdesk/mdesk.module').then(x => x.MDeskModule),
        canActivate: [NgxPermissionsGuard],
      },
      {
        path: 'smstemplates',
        loadChildren: () => import('./views/workflow-sms-templates/workflow-sms-templates.module').then(x => x.WorkflowSmsTemplatesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Sms Templates',
          breadcrumb: 'SMSTEMPLATES',
          permissions: {
            only: ['superadmin', 'admin', 'manager'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'emailtemplates',
        loadChildren: () => import('./views/workflow-email-templates/workflow-email-templates.module').then(x => x.WorkflowEmailTemplatesModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Email Templates',
          breadcrumb: 'EMAILTEMPLATES',
          permissions: {
            only: ['superadmin', 'admin', 'manager'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'dealstages',
        loadChildren: () => import('./views/portal-deal-stage/portal-deal-stage.module').then(x => x.PortalDealStageModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'DealStages',
          breadcrumb: 'DEALSTAGEs',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'vehicledata',
        loadChildren: () => import('./views/vehicle-data/vehicle-data.module').then(x => x.VehicleDataModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Vehicle Data',
          breadcrumb: 'VEHICLEDATA',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'workflow-settings',
        loadChildren: () => import('./views/workflow-settings/workflow-settings.module').then(x => x.WorkflowSettingsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Workflow Settings',
          breadcrumb: 'WORKFLOW SETTINGS',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          }
        },
      },
      {
        path: 'concierge-user-settings',
        loadChildren: () => import('./views/concierge-user-settings/concierge-user-settings.module').then(x => x.ConciergeUserSettingsModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          title: 'Concierge User Settings',
          breadcrumb: 'CONCIERGE USER SETTINGS',
          permissions: {
            only: ['superadmin', 'admin'],
            redirectTo: '/sessions/404'
          }
        },
      },
    ],
  },
  {
    path: 'prints',
    component: PrintLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/prints/prints.module').then(x => x.PrintsModule),
        data: { title: '' },
      },
    ],
  },

  
  {
    path: '**',
    redirectTo: 'sessions/404',
  },
];
