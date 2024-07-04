import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { UiComponent } from './layouts/home-layout/ui.component';
import { DefaultLayoutComponent } from './layouts/dashboard-layout';
// import { LoginComponent } from './views/auth/login/login.component';
import { AuthGuard } from './shared-ui/guard/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  // { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'ui', component: UiComponent, data: { title: 'Home' }, pathMatch: 'full' },
  { path: 'admin', component: DefaultLayoutComponent, data: { title: 'Home' }, pathMatch: 'full' },
  { path: 'auth', component: AuthLayoutComponent, data: { title: 'Auth' }, pathMatch: 'full' }
];
/* , preloadingStrategy: PreloadAllModules,
    onSameUrlNavigation: 'reload'*/
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {
}
