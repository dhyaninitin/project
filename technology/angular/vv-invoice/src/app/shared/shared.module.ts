import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LogoutDialogComponent } from './logout-dialog/logout-dialog.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import {RouterModule} from '@angular/router';
import { CustomEditorComponent } from './custom-editor/custom-editor.component';
import { FormsModule } from '@angular/forms';
import { ImageResizeComponent } from './image-resize/image-resize.component';

@NgModule({
  declarations: [
    DeleteDialogComponent,
    PageNotFoundComponent,
    LogoutDialogComponent,
    SidebarComponent,
    CustomEditorComponent,
    ImageResizeComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule
  ],
  exports:[
    DeleteDialogComponent,
    PageNotFoundComponent,
    LogoutDialogComponent,
    SidebarComponent,
    CustomEditorComponent,
    ImageResizeComponent
  ]
})
export class SharedModule { }
