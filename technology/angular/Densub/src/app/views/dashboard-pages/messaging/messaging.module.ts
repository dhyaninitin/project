import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessagingRoutingModule } from './messaging-routing.module';
import { MessagingComponent } from './messaging.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { LightboxModule } from 'ngx-lightbox';
import { ClickOutsideModule } from 'ng-click-outside';
import 'emoji-mart/css/emoji-mart.css'
import { TruncateModule } from 'ng2-truncate';

@NgModule({
  declarations: [MessagingComponent],
  imports: [
    CommonModule,
    MessagingRoutingModule,
    FormsModule,
    // ReactiveFormsModule,
    PickerModule,
    LightboxModule,
    ClickOutsideModule,
    TruncateModule
  ]
})
export class MessagingModule { }
