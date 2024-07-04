import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { PracticeService } from '../../dashboard-pages/admin/practice/practice.service';
import { SkillsService } from '../../dashboard-pages/admin/skills/skills/skills.service';
import * as moment from 'moment';


@Component({
  selector: 'app-dental-staff-list',
  templateUrl: './dental-staff-list.component.html',
  styleUrls: ['./dental-staff-list.component.scss']
})
export class DentalStaffListComponent implements OnInit {

  constructor(
    private practiceService: PracticeService,
    private globalService:GlobalService,
    private skillsService: SkillsService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
    ) {
      this.globalService.topscroll();

     }

  ngOnInit() {

  }
}
