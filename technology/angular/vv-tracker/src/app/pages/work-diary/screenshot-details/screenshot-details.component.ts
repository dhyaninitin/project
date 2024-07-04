import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { AdminService } from "../../shared/services/admin.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeleteDialogComponent } from "../../shared/delete-dialog/delete-dialog.component";
import { ViewFullScreenshotComponent } from "./view-full-screenshot/view-full-screenshot.component";
import { AuthService } from "../../shared/services/auth.service";

@Component({
  selector: "vex-screenshot-details",
  templateUrl: "./screenshot-details.component.html",
  styleUrls: ["./screenshot-details.component.scss"],
})
export class ScreenshotDetailsComponent implements OnInit {
  role: any;
  adminId: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public userData: any,
    private dialogRef: MatDialogRef<ScreenshotDetailsComponent>,
    private _adminSer: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authSer: AuthService
  ) {}

  ngOnInit(): void {
    this.getAdminDetails();
  }

  onClose() {
    this.dialogRef.close();
  }

  getAdminDetails() {
    this._authSer.tokenDecoder(null);
    this.role = this._authSer.role;
    this.adminId = this._authSer.adminId;
  }

  onDeleteScreenshot(userData: any) {
    let selectedScreenshots = [];
    selectedScreenshots.push(userData);

    this.dialog
      .open(DeleteDialogComponent, {
        width: "350px",
        height: "auto",
        disableClose: true,
        data: "this screenshot",
        panelClass: "confirm-dialog-container",
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          this._adminSer
          .deleteUserScreehshot(this.adminId, selectedScreenshots, this.userData.date)
          .subscribe((res: any) => {
            if (res) {
              this.dialogRef.close([selectedScreenshots[0]._id]);
              this.snackBar.open(res.message, "Cancel", {
                duration: 3000,
                panelClass: ["success-snackbar"],
              });
            }
          });
        }
      });
  }

  viewFullScreenshot(screen: any) {
    this.dialog.open(ViewFullScreenshotComponent, {
      width: 'auto',
      height: 'auto',
      data: screen
    })
  }
}
