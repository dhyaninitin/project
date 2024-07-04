import { Component, EventEmitter, OnInit, Output, Renderer2 } from '@angular/core';
import { OfferService } from '../../../shared/services/offer.service';

@Component({
  selector: 'offer-letter-dialog',
  templateUrl: './offer-letter-dialog.component.html',
  styleUrls: ['./offer-letter-dialog.component.scss']
})
export class OfferLetterDialogComponent implements OnInit {
  @Output() close = new EventEmitter <boolean>();

  constructor(
    public offerService: OfferService,
    private renderer: Renderer2
    ) { }

  ngOnInit(): void { }
 
  closeDrawer() {
    this.close.emit(false);
  }

  downloadDocument() {
    const link = this.renderer.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', this.offerService.offerUrl);
    link.setAttribute('download', 'text.pdf');
    link.click();
    link.remove()
  }

  printDocument() {
    const WindowPrt: any = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt.document.write("<h1>Hello plz find the details here!</h1>");
    WindowPrt.document.close();
    WindowPrt.focus();
    WindowPrt.print();
    WindowPrt.close();
  }

  shareDocument() {
    // add share functionality here
  }
}
