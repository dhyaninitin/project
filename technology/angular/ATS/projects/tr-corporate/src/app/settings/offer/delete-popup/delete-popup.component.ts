import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent implements OnInit {
  @Output() confirm = new EventEmitter<boolean>();
  @Input() popupInfo: any;
  constructor() { }

  ngOnInit(): void {
  }

  remove() {
    this.confirm.emit(true);
  }

  cancel() {
    this.confirm.emit(false);
  }
}
