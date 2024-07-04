import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { SharedModule } from './../../shared/shared.module';

import { AppBlankComponent } from './app-blank/app-blank.component';
import { AppGalleryComponent } from './app-gallery/app-gallery.component';
import { AppPricingComponent } from './app-pricing/app-pricing.component';
import { AppUsersComponent } from './app-users/app-users.component';
import { Nested1Component } from './nested1/nested1.component';
import { Nested2Component } from './nested2/nested2.component';
import { Nested3Component } from './nested3/nested3.component';
import { OthersRoutes } from './others.routing';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatChipsModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTabsModule,
    MatInputModule,
    MatProgressBarModule,
    FlexLayoutModule,
    NgxDatatableModule,
    ChartsModule,
    FileUploadModule,
    SharedModule,
    RouterModule.forChild(OthersRoutes),
  ],
  declarations: [
    AppGalleryComponent,
    AppPricingComponent,
    AppUsersComponent,
    AppBlankComponent,
    Nested1Component,
    Nested2Component,
    Nested3Component,
  ],
})
export class OthersModule {}
