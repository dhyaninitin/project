import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { CheckRouteGuard } from './modules/auth/guard/check-route.guard';
import { SessionExpiredComponent } from './shared/components/session-expired/session-expired.component';
import { AdminLoginComponent } from './modules/auth/components/admin-login/admin-login.component';

const routes: Routes = [
  { path: '', redirectTo: 'sign-up', pathMatch: 'full' },
  { path: ':sessionId/sign-up', canActivate: [CheckRouteGuard], loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
  { path: 'test', canActivate: [AuthGuard], loadChildren: () => import('./modules/examination/examination.module').then(m => m.ExaminationModule) },
  { path: 'dashboard', canActivate: [AuthGuard], loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: '**', redirectTo: 'session-expired' },
  { path: 'session-expired', component: SessionExpiredComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
