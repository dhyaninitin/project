import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';

@Component({
  selector: 'app-work-diary',
  templateUrl: './work-diary.component.html',
  styleUrls: ['./work-diary.component.scss']
})
export class WorkDiaryComponent implements OnInit {

  dropdownSettings: any = {};
  closeDropdownSelection = false;
  disabled = false;
  skillsList: any = [];
  jobList: any = [];
  job: any ;
  order: string = "DentalPracticeName";
  reverse: boolean = false;
  itemsPerPage = 10;
  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
  }

  constructor(
    private globalService: GlobalService,
  ) {
    this.globalService.topscroll();
    this.setOrder("DentalPracticeName");
    // setTimeout(() => {
    //   this.PositionTypeData = this.globalService.positionTypeData;
    //   this.experienceData = this.globalService.experienceData;
    // }, 2000);
  }

  ngOnInit() {
  }

}
