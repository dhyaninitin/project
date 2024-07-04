import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllBlogsRoutingModule } from './all-blogs-routing.module';
import { AllBlogsComponent } from './all-blogs.component';



@NgModule({
  declarations: [AllBlogsComponent],
  imports: [
    CommonModule,
    AllBlogsRoutingModule
  ]
})
export class AllBlogsModule { }
