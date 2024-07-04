import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../shared-ui/shared-ui.module';
import { LoginComponent } from './login.component';
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
    // '899226824522-rqtivt43oo57qo0nsoi0g1puamu09g05.apps.googleusercontent.com'
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
    LoginRoutingModule,
    FormsModule,
    SharedUiModule,
    SocialLoginModule,
    ModalModule.forRoot(),
  ],
  declarations: [LoginComponent],
  providers: [
    AuthService,
    {
      provide: AuthServiceConfig,
      useFactory: socialConfigs
    }
  ]
})
export class LoginModule {}
