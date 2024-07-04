import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { NumericInputDirective } from 'src/app/shared/directives/allow-numbers-only.directive';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';


@NgModule({
  declarations: [
    SignUpComponent,
    NumericInputDirective,
    AdminLoginComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MaterialModule,
  ]
})
export class AuthModule { }
