import { ViewChild, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AccordionPanelComponent } from 'ngx-bootstrap/accordion';
import { GlobalService } from '../../../shared-ui/service/global.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FaqComponent implements OnInit {
  @ViewChild('p1', {static: true}) p1: AccordionPanelComponent;
  @ViewChild('p2', {static: true}) p2: AccordionPanelComponent;
  @ViewChild('p3', {static: true}) p3: AccordionPanelComponent;
  @ViewChild('p4', {static: true}) p4: AccordionPanelComponent;
  @ViewChild('p5', {static: true}) p5: AccordionPanelComponent;
  @ViewChild('p6', {static: true}) p6: AccordionPanelComponent;
  isP1Open: boolean = false;
  isP2Open: boolean = true;

  open(panelNum) {
    const panel = this[`p${panelNum}`];
    panel.isOpen = !panel.isOpen;
  }
  constructor(
    private globalService: GlobalService
  ) { 
    this.globalService.topscroll();
  }
  
  ngOnInit() {
  }

}
