import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { ProfileOverviewEditComponent } from "../overview-edit/overview-edit.component";

@Component({
    selector: 'app-reset-required',
    templateUrl: './reset-required.component.html',
    styleUrls: [],
  })
  export class ResetRequiredComponent implements OnInit {
    
    constructor(private router: Router,
    @Inject(MAT_DIALOG_DATA) public defaults: any,
    private dialogRef: MatDialogRef<ResetRequiredComponent>,
    private dialog: MatDialog
    ) {

    }

    ngOnInit() {
    }

    resetRequired() {
        this.dialogRef.close();
        this.router.navigateByUrl("/profile");
        this.dialog.open(ProfileOverviewEditComponent, {
            width: '720px',
            disableClose: true
        }).afterClosed().subscribe(res => {
            if(!res) {
                this.dialog.open(ResetRequiredComponent, {
                    width: '520px',
                    disableClose: true
                });
            }
        }); 
    }
  }