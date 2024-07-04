import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "vex-view-user",
  templateUrl: "./view-user.component.html",
  styleUrls: ["./view-user.component.scss"],
})
export class ViewUserComponent implements OnInit {
  selectedTab: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) public id: any,
    private dialogRef: MatDialogRef<ViewUserComponent>
  ) {}

  ngOnInit(): void {
    this.tabChanger(0);
  }

  onClose() {
    this.dialogRef.close();
  }

  tabChanger(index: any) {
    if (index == 0) {
      this.selectedTab = index;
    } else if (index == 1) {
      this.selectedTab = index;
    } else if (index == 2) {
      this.selectedTab = index;
    }
  }
}
