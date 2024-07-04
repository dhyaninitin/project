import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface Iconfirm {
  title: string;
  subtitle: string;
  message: string;
  buttons: string[];
}

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  title!: string;
  subtitle!: string;
  message!: string;
  buttons!: string[];

  constructor(
    public dialogRef: MatDialogRef<ConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Iconfirm,
  ) {
    this.title = this.data?.title || 'Confirm your action';
    this.subtitle = this.data?.subtitle || '';
    this.message = this.data?.message || 'Please confirm your action. This action can not be undone.';
    this.buttons = this.data?.buttons || ['Cancel', 'Confirm'];;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm() {
    this.dialogRef.close(true);
  }

  ngOnInit(): void {
  }

}
