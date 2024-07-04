import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent implements OnInit {
  whatToDelete: string = '';
  deleteIcon = '../../../../assets/icons/del-icon.png'

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.whatToDelete = this.data
  }

}
