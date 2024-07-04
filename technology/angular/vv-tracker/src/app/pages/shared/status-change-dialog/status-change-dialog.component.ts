import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-status-change-dialog',
  templateUrl: './status-change-dialog.component.html',
  styleUrls: ['./status-change-dialog.component.scss']
})
export class StatusChangeDialogComponent implements OnInit {
  status: string = '';
  statusIcon = '../../../../assets/icons/attention.png'
  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<StatusChangeDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.status = this.data
  }

}
