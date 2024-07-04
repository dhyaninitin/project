import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@cloudtalentrecruit/ng-core';


@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private snackBar: MatSnackBar, private translate: TranslatePipe) { }
  open(message: string, action?: string, duration: number = 4000, className?: string) {
    this.snackBar.open(message, this.translate.transform(action || ''), { duration })
  }
}
