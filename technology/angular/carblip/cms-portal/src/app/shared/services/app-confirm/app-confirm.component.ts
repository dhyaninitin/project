import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  template: `
    <h1 matDialogTitle class="mb-05">{{ data.title }}</h1>
    <div mat-dialog-content class="mb-1 mt-4">{{ data.message }}</div>
    <div mat-dialog-actions class="justify-content-end mt-4">
      <button
        type="button"
        color="warn"
        mat-raised-button
        (click)="dialogRef.close(false)"
      >
        {{ data.cancelLabel }}
      </button>
      <button
        type="button"
        mat-raised-button
        color="primary"
        (click)="dialogRef.close(true)"
      >
        {{ data.okLabel }}
      </button>
    </div>
  `,
})
export class AppComfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<AppComfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
