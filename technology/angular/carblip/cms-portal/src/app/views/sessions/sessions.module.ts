import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { SharedModule } from 'app/shared/shared.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

// import { CommonDirectivesModule } from './sdirectives/common/common-directives.module';
import { ErrorComponent } from './error/error.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockscreenComponent } from './lockscreen/lockscreen.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SessionsRoutes } from './sessions.routing';
import { SigninComponent } from './signin/signin.component';
import { SignoutComponent } from './signout/signout.component';
import { SignupComponent } from './signup/signup.component';
import { NgOtpInputModule } from  'ng-otp-input';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SharedMaterialModule,
    PerfectScrollbarModule,
    NgOtpInputModule,
    RouterModule.forChild(SessionsRoutes),
  ],
  declarations: [
    ForgotPasswordComponent,
    ResetPasswordComponent,
    LockscreenComponent,
    SigninComponent,
    SignupComponent,
    SignoutComponent,
    NotFoundComponent,
    ErrorComponent,
  ],
})
export class SessionsModule {}
