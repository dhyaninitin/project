import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DeleteDialogComponent>
  ) {
  }

  ngOnInit(): void {
  }

  delete() {
    this.dialogRef.close({ action: 'delete' })
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' })
  }
}
