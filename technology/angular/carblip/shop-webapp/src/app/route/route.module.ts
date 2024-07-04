import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {
  NoPreloading,
  PreloadAllModules,
  RouterModule,
  Routes,
} from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';

import { environment } from 'environments/environment';
// if you don't want to lazy load the features module,
// simply put the loadFeaturesModule as value of loadChildren
// import { FeaturesModule } from './features/features.module';

// export function loadFeaturesModule() {
//   return FeaturesModule;
// }

import { LayoutComponent } from 'app/layout/layout.component';
import { LeadLayoutComponent } from 'app/layout/lead-layout.component';
import { CalculatorComponent } from 'app/route/calculator/calculator.component';
import { CreditApplicationComponent } from 'app/route/credit-application/credit-application.component';
import { FaqComponent } from 'app/route/faq/faq.component';
import { LogoutComponent } from 'app/route/logout/logout.component';
import { MyRequestComponent } from 'app/route/my-request/my-request.component';
import { RegisterComponent } from 'app/route/register/register.component';

import { AuthGuard } from 'app/shared/services/auth.guard';
import { CreateRequestService } from 'app/shared/services/create-request.service';
import { CreditApplicationService } from 'app/shared/services/credit-application.service';
import { FacebookLeadsService } from 'app/shared/services/facebook-leads.service';
import { SearchResultService } from 'app/shared/services/search-result.service';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { UserLeaseComponent } from './user-lease/user-lease.component';
import { PromoCodeComponent } from 'app/layout/promo/promo-code/promo-code.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'find-my-car', pathMatch: 'full' },
      {
        path: 'credit-application',
        component: CreditApplicationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'custom-request',
        loadChildren:
          './custom-request/custom-request.module#CustomRequestModule',
      },
      {
        path: 'calculator',
        component: CalculatorComponent,
      },
      {
        path: 'my-request',
        component: MyRequestComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'find-my-car',
        loadChildren: './find-my-car/find-my-car.module#FindMyCarModule',
      },
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'profile-settings',
        component: ProfileSettingsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'logout',
        component: LogoutComponent,
      },
    ],
  },
  {
    path: 'lease',
    component: LeadLayoutComponent,
    children: [
      {
        path: '',
        component: UserLeaseComponent,
      },
    ],
  },
  {
    path: ':id',
    component: PromoCodeComponent
  },
  // Not found
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: environment.preloadAllLazyLoadedModules
        ? PreloadAllModules
        : NoPreloading,
    }),
  ],
  exports: [RouterModule, SharedModule],
  declarations: [
    FaqComponent,
    ProfileSettingsComponent,
    MyRequestComponent,
    LogoutComponent,
    UserLeaseComponent,
    CalculatorComponent,
    CreditApplicationComponent,
    RegisterComponent,
  ],
  providers: [
    AuthGuard,
    SearchResultService,
    FacebookLeadsService,
    CreateRequestService,
    CreditApplicationService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppRoutingModule {}
