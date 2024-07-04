import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "./material/shared.module";
import { DeleteDialogComponent } from "./delete-dialog/delete-dialog.component";
import { LogoutDialogComponent } from "./logout-dialog/logout-dialog.component";
import { DatePickerRangeComponent } from './date-picker-range/date-picker-range.component';
import { StatusChangeDialogComponent } from './status-change-dialog/status-change-dialog.component';

@NgModule({
  declarations: [DeleteDialogComponent, LogoutDialogComponent, DatePickerRangeComponent, StatusChangeDialogComponent],
  imports: [CommonModule, MaterialModule],
  exports: [DeleteDialogComponent, LogoutDialogComponent, DatePickerRangeComponent, StatusChangeDialogComponent],
})
export class SharedModule {}
