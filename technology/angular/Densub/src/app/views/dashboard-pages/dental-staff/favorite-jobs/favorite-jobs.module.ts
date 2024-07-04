import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavoriteJobsRoutingModule } from './favorite-jobs-routing.module';
import { FavoriteJobsComponent } from './favorite-jobs.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { ModalModule } from 'ngx-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { NgxImageCompressService } from 'ngx-image-compress';


@NgModule({
  declarations: [FavoriteJobsComponent],
  imports: [
    CommonModule,
    FavoriteJobsRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    SharedUiModule,
    ModalModule.forRoot(),
    NgxEditorModule,
    PDFExportModule,
    NgxBootstrapSliderModule
  ],
  providers: [NgxImageCompressService]
})
export class FavoriteJobsModule { }
