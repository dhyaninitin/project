import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';
import * as moment from 'moment';

@Component({
  selector: 'app-job-listing',
  templateUrl: './job-listing.component.html',
  styleUrls: ['./job-listing.component.scss']
})
export class JobListingComponent implements OnInit {
  constructor(
    private globalService: GlobalService
  ) {
    this.globalService.topscroll();
  }

  ngOnInit() {
  }

}
