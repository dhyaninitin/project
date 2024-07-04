import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalService } from '../service/global.service';
@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
  subscription: Subscription; 
  loadingLabel: string =  "Loading... Please Wait.";
  constructor(
    private globalService: GlobalService
  ) {
    this.subscription = this.globalService.getLoadingLabel().subscribe(message => {
      if (message) {
        this.loadingLabel = message.text;
      }
    });
  }
   
  ngOnInit() {
  }

}
