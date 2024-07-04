import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {

  constructor(
    private globalService: GlobalService
  ) {
    this.globalService.topscroll();
   }

  ngOnInit() {
  }

}
