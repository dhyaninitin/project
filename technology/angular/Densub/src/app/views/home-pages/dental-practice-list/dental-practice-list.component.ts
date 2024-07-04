import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UsersService } from '../../../shared-ui/service/users.service';
import { AlertService } from '../../../shared-ui/alert/alert.service';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { PracticeService } from '../../dashboard-pages/admin/practice/practice.service';

@Component({
  selector: 'app-dental-practice-list',
  templateUrl: './dental-practice-list.component.html',
  styleUrls: ['./dental-practice-list.component.scss']
})
export class DentalPracticeListComponent implements OnInit {
  practiceTypeList: any = [];
  practiceList: any = [
    {
      firstName: 'Bharat Kumar',
      lastName: 'Sen',
      positionType: 'General',
    },
    {
      firstName: 'Suraj',
      lastName: 'Chauhan',
      positionType: 'Pediatric Dentistry',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'Endodontics',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'Pediatric Dentistry',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'General',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'Prosthodontics',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'General',
    },
    {
      firstName: 'Bharat Kumar',
      lastName: 'Bharat Kumar',
      positionType: 'Prosthodontics',
    },
  ];
  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private alertService: AlertService,
    private jwtService: JwtService,
    private practiceService: PracticeService
  ) { 
    this.globalService.topscroll();
  }

  ngOnInit() {
    this.getPracticeData();
  }

  getPracticeData() {
    this.spinner.show();
    this.practiceService.getPractice({}).subscribe(
      data => {
        if (data.status === 200) {
          this.practiceTypeList = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          "There are some server Please check connection.",
          "Error"
        );
      }
      );
    }

}
