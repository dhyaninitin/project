import { Component, OnInit,ViewEncapsulation, ViewChild  } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { AdvertisementService } from '../../../shared-ui/service/advertisement.service';
import { ModalDirective } from 'ngx-bootstrap';
import { currentUser } from '../../../layouts/home-layout/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  @ViewChild('getStarted', {static: false}) public getStarted: ModalDirective;
  currentUser: currentUser = new currentUser;
  advertisementList: any = [];
  public itemsPerSlide = 1;
  public singleSlideOffset = false;
  public noWrap = false;
  public cycleInterval = 5000;
  public showIndicators = false;
  public jobTypes = environment.USER_TYPE;
  constructor(
    private router: Router,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private advertisementService:AdvertisementService,
    private jwtService: JwtService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.getadvertisementData();
  }

  getadvertisementData() {
    // this.spinner.show();
    this.advertisementService.getAdvertiseList({}).subscribe(
      data => {
        if (data.status === 200) {
          this.advertisementList = data.data;
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }
  getStartedDensub() {
    // this.router.navigate(['/signup/' + type]);
    this.getStarted.show();
  }

}
