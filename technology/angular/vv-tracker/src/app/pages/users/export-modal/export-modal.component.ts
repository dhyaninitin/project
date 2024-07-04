import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdminService } from "../../shared/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "vex-export-modal",
  templateUrl: "./export-modal.component.html",
  styleUrls: ["./export-modal.component.scss"],
})
export class ExportModalComponent implements OnInit {
  @ViewChild("downloadLink", { static: false }) downloadLink: ElementRef;
  exportForm: FormGroup;
  adminId: any;
  daysList = [
    { id: 1, value: "Custom" },
    { id: 2, value: "3" },
    { id: 3, value: "5" },
    { id: 4, value: "7" },
    { id: 5, value: "15" },
    { id: 6, value: "30" },
    { id: 7, value: "60" },
    { id: 8, value: "90" },
    { id: 9, value: "365" },
  ];
  constructor(
    private fb: FormBuilder,
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ExportModalComponent>,
    public _authSer: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getAdminDetails();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.adminId = this._authSer.adminId
  }

  initForm() {
    this.exportForm = this.fb.group({
      days: ["", Validators.required],
      from: ["", Validators.required],
      to: ["", Validators.required],
    });
  }

  updateFromToDate() {
    const selectedDays = this.exportForm.value.days;
    if (selectedDays !== 1) {
      const daysObject = this.daysList.find((item) => item.id == selectedDays);
      if (daysObject) {
        const fromDaysValue = daysObject.value;
        const toDate = new Date(); // Current date
        const fromDate = new Date(toDate);
        fromDate.setDate(toDate.getDate() - +fromDaysValue + 1);
        this.exportForm.patchValue({ from: fromDate, to: toDate });
      }
    }
  }

  export() {
    if (this.exportForm.invalid && this.exportForm.value.days == 1) {
      this.exportForm.markAllAsTouched();
      return;
    }
    this.updateFromToDate();
    const from = this.exportForm.value.from;
    const to = this.exportForm.value.to;
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    let payload = {
      from: from,
      to: to,
    };
    this._adminSer.exportFromTo(this.adminId, payload).subscribe(
      (res: any) => {
        if (res && res.url) {
          this.downloadLink.nativeElement.href = res.url;
          this.downloadLink.nativeElement.click();
          this.snackBar.open(res.msg, "Cancel", {
            duration: 3000,
            panelClass: "success-snackbar",
          });
          this.dialogRef.close(true);
        }
      },
      (error) => {  
        this.snackBar.open(error.error.msg, "Cancel", {
          duration: 3000,
          panelClass: "error-snackbar",
        });
        this.dialogRef.close();
      }
    );
  }
}
