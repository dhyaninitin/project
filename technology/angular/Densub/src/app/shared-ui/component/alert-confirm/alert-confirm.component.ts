import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AlertConfirm } from './alert-confirm.modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-alert-confirm',
  templateUrl: './alert-confirm.component.html',
  styleUrls: ['./alert-confirm.component.scss']
})
export class AlertConfirmComponent implements OnInit {
  @Input() alertDetails: AlertConfirm;
  public onClose = new Subject<boolean>();
  isAlreadyExist = false;

  constructor(private _bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

  close() {
      this.onClose.next(false);
      this._bsModalRef.hide();
      this.alertDetails = new AlertConfirm();
    }

    confirm() {
      this.onClose.next(true);
      this._bsModalRef.hide();
      this.alertDetails = new AlertConfirm();
    }


    checkIsAlreadyExit() {
      if (this.alertDetails.matchArray && this.alertDetails.matchArray.length) {
        let found = [];
        const self = this;
        if (this.alertDetails.currentSelection._id) {
          found = this.alertDetails.matchArray.filter(
            obj => (String(obj[self.alertDetails.inputText.name])).toLowerCase() ===
                      self.alertDetails.currentSelection[self.alertDetails.inputText.name].toLowerCase()
                   && obj['_id'] !== self.alertDetails.currentSelection._id);
        } else {
          found = this.alertDetails.matchArray.filter (
            obj => (String(obj[self.alertDetails.inputText.name])).toLowerCase() ===
                    self.alertDetails.currentSelection[self.alertDetails.inputText.name].toLowerCase()
            );
        }
        if (found.length) {
          this.isAlreadyExist = true;
        } else {
          this.isAlreadyExist = false;
        }

      } else {
        this.isAlreadyExist = false;
      }
    }

    showConfirmBtn() {
      if (this.alertDetails && this.alertDetails.confirmButton && this.alertDetails.confirmButton.show) {
        if ( this.alertDetails.inputText && this.alertDetails.inputText.show  ||
              this.alertDetails.selectInput && this.alertDetails.selectInput.show) {
                const inputCond = (
                  this.alertDetails && this.alertDetails.confirmButton &&
                  this.alertDetails.confirmButton.show && !this.isAlreadyExist &&
                  this.alertDetails.currentSelection[this.alertDetails.inputText.name]
                );
                if (this.alertDetails.selectInput && this.alertDetails.selectInput.show) {
                  if (this.alertDetails.selectInput['selectSingle']) {
                    // Select Single Input
                    return inputCond && this.alertDetails.currentSelection[this.alertDetails.selectInput.name];
                  } else {
                    // Select Multiple Input
                    return inputCond && this.alertDetails.currentSelection[this.alertDetails.selectInput.name] &&
                     this.alertDetails.currentSelection[this.alertDetails.selectInput.name].length;
                  }
                }
                return inputCond;
                // Single Input
        }
        return true;
      } else {
        return false;
      }
    }
}
