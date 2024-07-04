import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(private globalService: GlobalService) {
    this.globalService.topscroll();
   }

  ngOnInit() {
  }

}
