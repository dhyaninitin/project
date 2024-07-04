import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTemplateRoutingModule } from './create-template-routing.module';
import { CreateTemplateComponent } from './create-template.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  declarations: [ CreateTemplateComponent ],
  imports: [
    CommonModule,
    CreateTemplateRoutingModule,
    HttpClientModule,
    AngularEditorModule,
    FormsModule,
    ModalModule.forRoot(),
    CKEditorModule
  ]
})
export class CreateTemplateModule { }
