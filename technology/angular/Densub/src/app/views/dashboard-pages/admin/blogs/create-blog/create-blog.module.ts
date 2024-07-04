import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateBlogRoutingModule } from './create-blog-routing.module';
import { CreateBlogComponent } from './create-blog.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxImageCompressService } from 'ngx-image-compress';
import { CKEditorModule } from 'ng2-ckeditor';


@NgModule({
  declarations: [CreateBlogComponent],
  imports: [
    CommonModule,
    CreateBlogRoutingModule,
    HttpClientModule,
    AngularEditorModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    CKEditorModule
  ],
  providers: [ NgxImageCompressService ]
  
})
export class CreateBlogModule { }
