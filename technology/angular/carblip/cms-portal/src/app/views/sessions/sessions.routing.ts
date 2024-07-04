import { Routes } from '@angular/router';

import { ErrorComponent } from './error/error.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SigninComponent } from './signin/signin.component';
import { SignoutComponent } from './signout/signout.component';
import { SignupComponent } from './signup/signup.component';

import { AnonymousGuard } from 'app/shared/services/auth/anonymous.guard';
import { AuthGuard } from 'app/shared/services/auth/auth.guard';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const SessionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'signin',
        // canActivate: [AnonymousGuard],
        pathMatch: 'full',
      },
      {
        path: 'signup',
        component: SignupComponent,
        canActivate: [AnonymousGuard],
        data: { title: 'Signup' },
      },
      {
        path: 'signin',
        component: SigninComponent,
        canActivate: [AnonymousGuard],
        data: { title: 'Signin' },
      },
      {
        path: 'signout',
        component: SignoutComponent,
        canActivate: [AuthGuard],
        data: { title: 'Signout' },
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Forgot password' },
      },
      {
        path: 'password/reset/:token',
        component: ResetPasswordComponent,
        data: { title: 'Reset password' },
      },
      {
        path: 'lockscreen',
        component: LockscreenComponent,
        data: { title: 'Lockscreen' },
      },
      {
        path: '404',
        component: NotFoundComponent,
        data: { title: 'Not Found' },
      },
      {
        path: 'error',
        component: ErrorComponent,
        data: { title: 'Error' },
      },
    ],
  },
];
