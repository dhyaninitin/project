import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';
declare var google : any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {
  latitude: number = -27.784812; 
  longitude: number = 153.2508088;
  map: google.maps.Map;
  public zoom: number = 12;
  constructor(
    private globalService: GlobalService
  ) { 
    this.globalService.topscroll();
  }

  ngOnInit() {
  }

}
