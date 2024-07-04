import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatToolbarModule} from '@angular/material/toolbar';


const materialcomponents: any[] | Type<any> | ModuleWithProviders<{}> = [
  MatButtonModule,
  MatIconModule,
  MatMenuModule,
  MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  FormsModule,
  MatInputModule,
  MatSelectModule,
  MatDialogModule,
  MatNativeDateModule,
  TextFieldModule,
  MatCheckboxModule,
  MatButtonToggleModule,
  MatTabsModule,
  MatSnackBarModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatInputModule,
  MatButtonModule,
  MatIconModule,
  MatRadioModule,
  MatSelectModule,
  MatMenuModule,
  MatDividerModule,
  MatDatepickerModule,
  MatSortModule,
  MatCardModule,
  MatSidenavModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatToolbarModule
];

@NgModule( {
  declarations: [],
  imports: [ CommonModule, materialcomponents ],
  exports: [ materialcomponents ],
} )
export class MaterialModule { }