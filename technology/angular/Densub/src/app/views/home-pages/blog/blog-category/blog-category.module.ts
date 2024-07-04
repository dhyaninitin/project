import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from '../../../../shared-ui/shared-ui.module';
import { BlogCategoryRoutingModule } from './blog-category-routing.module';
import { BlogCategoryComponent } from './blog-category.component';



@NgModule({
  imports: [
    CommonModule,
    SharedUiModule,
    BlogCategoryRoutingModule
  ],
  declarations: [BlogCategoryComponent]
})
export class BlogCategoryModule { }
