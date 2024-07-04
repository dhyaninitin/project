import { CommonModule  } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { UserEffects } from 'app/store/users/users.effects';
import { store } from 'app/store/users/users.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { ProfileOverviewEditComponent } from './overview-edit/overview-edit.component';
import { ProfileOverviewComponent } from './overview/overview.component';
import { ProfilePreviewComponent } from './profile-preview/profile-preview.component';
import { ProfileUploadComponent } from './profile-upload/profile-upload.component';
import { ProfileComponent } from './profile.component';
import { ProfileRoutes } from './profile.routing';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ResetRequiredComponent } from './reset-required/reset-required.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { NgOtpInputModule } from  'ng-otp-input';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    ImageCropperModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(ProfileRoutes),

    StoreModule.forFeature(store.name, store.usersReducer),
    EffectsModule.forFeature([UserEffects]),
    NgxQRCodeModule,
    NgOtpInputModule
  ],
  declarations: [
    ProfileComponent,
    ProfileOverviewComponent,
    ProfileOverviewEditComponent,
    ProfileUploadComponent,
    ProfilePreviewComponent,
    ResetRequiredComponent
  ],
  providers: [],
  entryComponents: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ]
})
export class ProfileModule {}
