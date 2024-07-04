import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxMaskModule } from 'ngx-mask';
import { MomentModule } from 'ngx-moment';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';

// SERVICES
import { AppConfirmService } from './services/app-confirm/app-confirm.service';
import { AppLoaderService } from './services/app-loader/app-loader.service';
import { AnonymousGuard } from './services/auth/anonymous.guard';
import { AuthGuard } from './services/auth/auth.guard';
import { NavigationService } from './services/navigation.service';
import { PendingChangesGuard } from './services/pending-changes.guard';
import { RoutePartsService } from './services/route-parts.service';
import { ThemeService } from './services/theme.service';

import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedComponentsModule } from './components/shared-components.module';
import { SharedDirectivesModule } from './directives/shared-directives.module';
import { SharedPipesModule } from './pipes/shared-pipes.module';
import { AuthService } from './services/auth/auth.service';
import { FormService } from './services/form.service';
import { LocalStorageService } from './services/local-storage.service';
import { GlobalService } from './services/apis/global.service';
import { WorkflowService } from './services/apis/workflow.service';

@NgModule({
  imports: [
    CommonModule,
    SharedComponentsModule,
    SharedPipesModule,
    SharedDirectivesModule,
    NgxMaskModule.forRoot(),
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MomentModule,
    NgxMaskModule
  ],
  providers: [
    ThemeService,
    NavigationService,
    RoutePartsService,
    AuthGuard,
    PendingChangesGuard,
    AnonymousGuard,
    AppConfirmService,
    AppLoaderService,
    AuthService,
    LocalStorageService,
    FormService,
    GlobalService,
    WorkflowService
  ],
  exports: [
    SharedComponentsModule,
    SharedPipesModule,
    SharedDirectivesModule,
    NgxPermissionsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MomentModule,
    NgxMaskModule
  ],
})
export class SharedModule {}
