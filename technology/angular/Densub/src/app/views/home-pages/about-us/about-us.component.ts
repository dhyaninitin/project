import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent implements OnInit {

  constructor(
    private globalService: GlobalService
  ) {
    this.globalService.topscroll();
   }

  ngOnInit() {
  }

}
