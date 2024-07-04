import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateBlogRoutingModule } from './create-blog-routing.module';
import { CreateBlogComponent } from './create-blog.component';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';



@NgModule({
  declarations: [CreateBlogComponent],
  imports: [
    CommonModule,
    CreateBlogRoutingModule,
    HttpClientModule,
    AngularEditorModule,
  ],
  
})
export class CreateBlogModule { }
