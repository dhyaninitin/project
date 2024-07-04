import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "vex-view-screenshot",
  templateUrl: "./view-screenshot.component.html",
  styleUrls: ["./view-screenshot.component.scss"],
})
export class ViewScreenshotComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public screenShotData: any,
    private dialogRef: MatDialogRef<ViewScreenshotComponent>
  ) {}

  ngOnInit(): void {}

  onCLose() {
    this.dialogRef.close();
  }
}
