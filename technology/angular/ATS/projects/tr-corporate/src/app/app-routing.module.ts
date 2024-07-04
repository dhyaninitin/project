import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoComponent } from './advance-search/demo/demo.component';
import { AuthGuard } from './core/guards/auth.guard';
import { PostLoginResolver } from './core/resolvers/post-login.resolver';
import { OfferModule } from './settings/offer/offer.module';
// import { AuthGuard } from './utility/guards/auth.guard';
// import { PostLoginResolver } from './utility/resolvers/post-login.resolver';

const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
    resolve: { data: PostLoginResolver }
  },
  {
    path: 'offer',
    loadChildren: () =>
      import("./settings/offer/offer.module").then((m)=> m.OfferModule)
  },
  {
    path: 'as',
    component: DemoComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: '**',
    redirectTo: 'auth',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
