import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupRoutingModule } from './signup-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { SignupComponent } from './signup.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ModalModule } from 'ngx-bootstrap';

import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  AuthService
} from 'angular-6-social-login';
import { SocialLoginModule, AuthServiceConfig } from 'angular-6-social-login';

export function socialConfigs() {
  const config = new AuthServiceConfig([
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider('1753952128063147')
    },
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        '700298469485-46ktgctd4j6sbvfo32qdeuk05hnd7oaa.apps.googleusercontent.com'
      )
    }
  ]);
  return config;
}

@NgModule({
  imports: [
    CommonModule,
    SignupRoutingModule,
    FormsModule,
    NgxCaptchaModule,
    ReactiveFormsModule,
    SharedUiModule,
    SocialLoginModule,
    ModalModule.forRoot(),
  ],
  declarations: [ SignupComponent ],
  providers: [
    AuthService,
    {
      provide: AuthServiceConfig,
      useFactory: socialConfigs
    }
  ]
})
export class SignupModule { }
