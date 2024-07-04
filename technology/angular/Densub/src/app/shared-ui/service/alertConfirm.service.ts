import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AlertConfirmComponent } from '../component/alert-confirm/alert-confirm.component';
import { ViewImageModalComponent } from '../component/view-image-modal/view-image-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AlertConfirmService {
  public modalRef: BsModalRef;

  constructor(private modalService: BsModalService) { }

  openPopup(alertDetails) {
    this.modalRef =  this.modalService.show(AlertConfirmComponent);
    this.modalRef.content.alertDetails = alertDetails;
    return this.modalRef.content.onClose;
  }

  openImagePopup(viewImage) {
    console.log(viewImage);
    this.modalRef =  this.modalService.show(ViewImageModalComponent);
    this.modalRef.content.viewImage = viewImage;
    return this.modalRef.content.onClose;
  }
  // How to use this modal service
  /*
    this.alertModalService.openPopup(this.alertDetails).subscribe(result => {
      console.log("Hello I am the result of modal popup",result);
    })
  */
 // Variable Example
 /*
    alertDetails = {
    title: 'Title',
    message: 'Hello',
    cancelButton : { show: true, name: 'Close'},
    confirmButton: { show: true, name: 'Confirm'},
  };
 */
}
