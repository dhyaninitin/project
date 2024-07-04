import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImportExcelComponent } from './import-excel.component';


const routes: Routes = [
  { path: '', component: ImportExcelComponent , data: { title: 'Import Excel' }, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ImportExcelRoutingModule { }
