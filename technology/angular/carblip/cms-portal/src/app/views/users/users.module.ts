import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { BreadcrumbsModule } from '@vex/components/breadcrumbs/breadcrumbs.module';
import { PageLayoutModule } from '@vex/components/page-layout/page-layout.module';
import { ScrollbarModule } from '@vex/components/scrollbar/scrollbar.module';
import { DealStageService } from 'app/shared/services/apis/dealstage.service';
import { UserService } from 'app/shared/services/apis/users.service';
import { VBrandService } from 'app/shared/services/apis/vbrand.service';
import { VehicleService } from 'app/shared/services/apis/vehicle.service';
import { VModelService } from 'app/shared/services/apis/vmodel.service';
import { SharedMaterialModule } from 'app/shared/shared-material.module';
import { UserEffects } from 'app/store/users/users.effects';
import { store } from 'app/store/users/users.index';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';
import { UsersDetailComponent } from './detail/detail.component';
import { MailThreadComponent } from './detail/mail-thread/mail-thread.component';
import { MailboxTableComponent } from './detail/mailbox-table/mailbox-table.component';
import { UsersRequestModalComponent } from './detail/request-modal/request-modal.component';
import { RequestTableComponent } from './detail/request-table/request-table.component';
import { UsersChatComponent } from './detail/user-sms/users-chat.component';
import { WholesaleTableComponent } from './detail/wholesale-table/wholesale-table';
import { UsersEditModalComponent } from './table/edit-modal/edit-modal.component';
import { UsersTableComponent } from './table/table.component';
import { UsersComponent } from './users.component';
import { UsersRoutes } from './users.routing';
import { QuillModule } from 'ngx-quill';
import { FileUploaderComponent } from './detail/file-uploader/file-uploader.component';
import { UserscallComponent } from './detail/user-call/users-call.component';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { ContactEngagementListComponent } from './detail/contact-engagement-list/contact-engagement-list.component';
import { ExportService } from 'app/shared/services/apis/export.service';
import { ContactSecondaryEmailsComponent } from './detail/contact-secondary-emails/contact-secondary-emails.component';
import { ContactSecondaryPhoneNumberComponent } from './detail/contact-secondary-phone-number/contact-secondary-phone-number.component';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule,
    FileUploadModule,
    SharedMaterialModule,
    SharedModule,
    RouterModule.forChild(UsersRoutes),

    StoreModule.forFeature(store.name, store.usersReducer),
    EffectsModule.forFeature([UserEffects]),
    PageLayoutModule,
    BreadcrumbsModule,
    ScrollbarModule,
    QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],

          [{ list: 'ordered' }, { list: 'bullet' }],

          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          ['clean'],

          ['link', 'image']
        ]
      }
    }),
    MatSelectInfiniteScrollModule
  ],
  declarations: [
    UsersComponent,
    UsersTableComponent,
    UsersEditModalComponent,
    UsersDetailComponent,
    UsersRequestModalComponent,
    RequestTableComponent,
    WholesaleTableComponent,
    MailboxTableComponent,
    UsersChatComponent,
    MailThreadComponent,
    FileUploaderComponent,
    UserscallComponent,
    ContactEngagementListComponent,
    ContactSecondaryEmailsComponent,
    ContactSecondaryPhoneNumberComponent,
  ],
  providers: [
    UserService,
    VBrandService,
    VModelService,
    VehicleService,
    DealStageService,
    ExportService
  ],
  entryComponents: [UsersEditModalComponent, UsersRequestModalComponent],
})

export class UsersModule {}
