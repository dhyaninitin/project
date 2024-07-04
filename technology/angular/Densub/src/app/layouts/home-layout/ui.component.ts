import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { currentUser } from './user.model';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { JwtService } from '../../shared-ui/service/jwt.service';
import { GlobalService } from '../../shared-ui/service/global.service';
import { environment } from '../../../environments/environment';
import { EventEmitterService } from '../../shared-ui/service/event-emitter.service';


@Component({
  selector: 'app-ui',
  templateUrl: './ui.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./ui-home.scss']
})

export class UiComponent implements OnInit {
  filterProperty: any = {};
  showHide: Boolean = false;
  subscription: Subscription;
  shouldShow: any;
  mobileSearchView = false;
  fullYear = new Date().getFullYear();
  currentUser: currentUser = new currentUser;
  userType: any = environment.USER_TYPE;
  quickSearchList: any[] = [];
  quickSearchText: any = {
    searchText: ''
  };
  dashboardLink = '/#/dashboard';
  loadingListings = false;
  staffMarketPlace = false;
  practiceMarketPlace = false;
  searchPositionTypeOrName = ''
  searchPositionTypeOrJobs = ''
  location = ''
  @ViewChild('signUpDen', {static: false}) public signUpDen: ModalDirective;
  constructor(
    private jwtService: JwtService,
    public router: Router,
    private globalService: GlobalService,
    private toastr: ToastrService,
    private eventEmitterService: EventEmitterService
  ) {
    this.globalService.topscroll();
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if (this.currentUser && this.currentUser.userType !== environment.USER_TYPE.ADMIN) {
      this.dashboardLink = '/#/' + this.currentUser.userType + '/dashboard';
    }
    this.subscription = this.globalService.getActionChildToParent().subscribe(message => {
      if (message) {
        this.currentUser = this.jwtService.currentLoggedUserInfo;
      }
    });
    this.router.events.subscribe(val =>{
      if(val instanceof NavigationEnd){
        if(this.router.url === '/dental-staffs'){
          this.staffMarketPlace = true;
        }else{
          this.staffMarketPlace = false;
        }
        if(this.router.url === '/job-listing'){
          this.practiceMarketPlace = true;
        }else{
          this.practiceMarketPlace = false;
        }
      }
    })
  }


  ngOnInit() {
    if(this.router.url === '/dental-staffs'){
      this.staffMarketPlace = true;
    }else{
      this.staffMarketPlace = false;
    }
    if(this.router.url === '/job-listing'){
      this.practiceMarketPlace = true;
    }else{
      this.practiceMarketPlace = false;
    }
  }

  firstComponentFunction(){    
    this.eventEmitterService.onStaffSearchComponentButtonClick(this.searchPositionTypeOrName,this.location);    
  } 

  onsubmitText($event){
    if($event.keyCode === 13){
      this.eventEmitterService.onStaffSearchComponentButtonClick(this.searchPositionTypeOrName,this.location);    
    }
  }

  secondComponentFunction(){
   this.eventEmitterService.onJobSearchButtonClick(this.searchPositionTypeOrJobs);
  }

  searchJobs($event){
    if($event.keyCode === 13){
      this.eventEmitterService.onJobSearchButtonClick(this.searchPositionTypeOrJobs);
    }
  }

  logout() {
    this.jwtService.destroyToken();
    this.router.navigate(['/']);
    this.toastr.success('You have logged out successfully. ');
    this.globalService.sendActionChildToParent('loggedOut');
    this.currentUser = JSON.parse(this.jwtService.getCurrentUser());
  }
  ShowSignUpModal() {
    this.signUpDen.show();
  }
  // closeModel() {
  //   this.signUpDen.hide();
  // }

  redirectToRegister(type: String) {
    this.hideMenu();
    this.router.navigate(['/signup/' + type]);
      this.signUpDen.hide();
  }

  hideMenu() {
    this.shouldShow = null;
  }

  searchRedirection() {
    if (!this.currentUser._id) {
      this.router.navigate(['/login']);
      return false;
    }
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    if (this.currentUser.userType === this.userType.PRACTICE) {
      this.router.navigate(['/dental-staffs']);
      return false;
    }
    if (this.currentUser.userType === this.userType.STAFF) {
      this.router.navigate(['/job-listing']);
      return false;
    }
  }

}
