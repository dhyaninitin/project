import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExcelRoutingModule } from './import-excel-routing.module';
import { ImportExcelComponent } from './import-excel.component';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [ImportExcelComponent],
  imports: [
    CommonModule,
    ImportExcelRoutingModule,
    FormsModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    OrderModule
  ]
})
export class ImportExcelModule { }
