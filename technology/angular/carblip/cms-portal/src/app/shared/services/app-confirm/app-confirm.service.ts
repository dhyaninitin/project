import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { AppComfirmComponent } from './app-confirm.component';

interface ConfirmData {
  title?: string;
  message?: string;
  okLabel?: string;
  cancelLabel?: string;
}

@Injectable()
export class AppConfirmService {
  constructor(private dialog: MatDialog) {}

  public confirm(data: ConfirmData = {}): Observable<boolean> {
    data.title = data.title || 'Confirm';
    data.message = data.message || 'Are you sure?';
    data.okLabel = data.okLabel || 'Ok';
    data.cancelLabel = data.cancelLabel || 'Cancel';
    let dialogRef: MatDialogRef<AppComfirmComponent>;
    dialogRef = this.dialog.open(AppComfirmComponent, {
      width: '380px',
      disableClose: true,
      data: {
        title: data.title,
        message: data.message,
        okLabel: data.okLabel,
        cancelLabel: data.cancelLabel,
      },
    });
    return dialogRef.afterClosed();
  }
}
