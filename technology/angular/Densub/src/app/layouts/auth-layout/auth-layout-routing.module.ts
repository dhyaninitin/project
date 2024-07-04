import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';


const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [

      {
        path: 'login',
        loadChildren: () => import('../../views/auth-pages/login/login.module').then(mod => mod.LoginModule)
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('../../views/auth-pages/forgot-password/forgot-password.module').then(mod => mod.ForgotPasswordModule)
      },
      {
        path: 'recover-password/:userId/:token',
        loadChildren: () => import('../../views/auth-pages/recover-password/recover-password.module').then(mod => mod.RecoverPasswordModule)
      },
      {
        path: 'signup/:type',
        loadChildren: () => import('../../views/auth-pages/signup/signup.module').then(mod => mod.SignupModule)
      },
      {
        path: 'email-verification/:userId/:token',
        // tslint:disable-next-line: max-line-length
        loadChildren: () => import('../../views/auth-pages/email-verification/email-verification.module').then(mod => mod.EmailVerificationModule)
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthLayoutRoutingModule { }
