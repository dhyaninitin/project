import { Component, OnInit, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-view-image-modal',
  templateUrl: './view-image-modal.component.html',
  styleUrls: ['./view-image-modal.component.scss']
})
export class ViewImageModalComponent implements OnInit {
  @Input() viewImage: any;
  public onClose = new Subject<boolean>();
  constructor(
    private _bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
    // console.log(this.viewImage);
  }

  close() {
    this.onClose.next(false);
    this._bsModalRef.hide();
  }

}
