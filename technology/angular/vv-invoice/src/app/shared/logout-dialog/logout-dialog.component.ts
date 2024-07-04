import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss'],
})
export class LogoutDialogComponent implements OnInit {
  userName: string = '';
  logoutIcon = '../../../assets/icon/logouticon-min (1).png'

  constructor(
    public dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.userName = this.data;
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
