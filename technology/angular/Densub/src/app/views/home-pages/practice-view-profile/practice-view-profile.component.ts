import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { GlobalService } from '../../../shared-ui/service/global.service';
import { UsersService } from '../../../shared-ui/service/users.service';
import { RatingService } from '../../../shared-ui/service/rating.service';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { AddressService } from '../../../shared-ui/service/address.service';
import { PaymentCardService } from '../../../shared-ui/service/paymentCard.service';
import { JobsService } from '../../dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { PracticeProfile } from '../../../shared-ui/modal/practice-profile.modal';
import { currentUser } from '../../../layouts/home-layout/user.model';
import { environment } from '../../../../environments/environment';
import { Favorite } from '../../../shared-ui/staff-list/favorite.model';
import { FavoriteService } from '../../../shared-ui/service/favorite.service';
import { AlertConfirm } from '../../../shared-ui/component/alert-confirm/alert-confirm.modal';
import { AlertConfirmService } from '../../../shared-ui/service/alertConfirm.service';

@Component({
  selector: 'app-practice-view-profile',
  templateUrl: './practice-view-profile.component.html',
  styleUrls: ['./practice-view-profile.component.scss']
})
export class PracticeViewProfileComponent implements OnInit, OnDestroy {
  practiceProfileInfo: any = new PracticeProfile();
  alertDetails: AlertConfirm = new AlertConfirm();
  activeTab = 'ActiveBids';
  userId = '';
  jobList = [];
  filterJobList = [];
  jobTypes: any = environment.JOB_TYPE;
  userTypes: any = environment.USER_TYPE;
  paymentMethod: any = environment.PAYEMENT_METHOD;
  viewProfileLink = '/#/job-details';
  itemsPerPage = 10;
  currentRoute: Boolean = false;
  ratingCount: Number = 0;
  currentUser: currentUser = new currentUser;
  sendOfferList: any = [];
  addressList: any = [];
  otherText = ['other', 'others'];
  getExpiryMonth = ''
  getExpiryYear = ''
  favorite: Favorite = new Favorite();
  isFavorite: Boolean = false;
  practiceId: any = '';
  practiceName: any;
  constructor(
    public globalService: GlobalService,
    private usersService: UsersService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private jobsService: JobsService,
    private router: Router,
    private location: Location,
    private ratingService: RatingService,
    private jwtService: JwtService,
    private addressService: AddressService,
    private PaymentCardService: PaymentCardService,
    private favoriteService: FavoriteService,
    private alertConfirmService: AlertConfirmService
  ) {
    this.globalService.topscroll();
    this.currentRoute = this.router.url.includes('/practice-profile'); // GET THE ROUTE NAME SET CONDITIONS ON HTML
  }
  ngOnDestroy(): void {
    this.globalService.showBackButtonOnPracticePublicPage = '';
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.route.params.subscribe(data => {
      this.userId = data['userId'];
      this.getUsersData();
    });
  }

  getPaymentCardDetail(email) {
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            const array = data.data;
            const card = array.filter(arr => arr.setAsPrimaryCard === true);
            this.getExpiryMonth = card[0].exp_month
            this.getExpiryYear = card[0].exp_year
          }
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  goBack() {
    this.location.back();
  }

  getUsersData() {
    this.spinner.show();
    const condition = {
      _id: this.userId,
      userType: environment.USER_TYPE.PRACTICE
    };
    this.usersService.getUserInfoWithDetails(condition).subscribe(
      data => {
        this.spinner.hide();
        if (data.status === 200) {
          this.practiceProfileInfo = data.data;
          this.getPaymentCardDetail(data.data.email);
          this.getAddressList();
          this.getJobs();
          this.getRatingsCount();
          this.getFavoriteList();
        } else {
          this.globalService.error();
        }
      },
      error => {
        this.globalService.error();
      }
    );
  }

  getRadiograph() {
    this.addressList.map(address => {
      if (address.radiograph && address.radiograph.id) {
        const found = environment.RADIOGRAPH.filter(val => val._id === address.radiograph.id);
        if (found) {
          address.radiograph.id = found[0];
        }
      }
    });
  }

  /*   getRadiograph() {
      if(this.practiceProfileInfo.radiograph && this.practiceProfileInfo.radiograph.id) {
        const found =  environment.RADIOGRAPH.filter(val => val._id === this.practiceProfileInfo.radiograph.id );
        if (found) {
          this.practiceProfileInfo.radiograph.id = found[0];
        }
      }
    } */

  getrecordMaintained() {
    this.addressList.map(address => {
      const found = environment.RECORD_MAINTAINED.filter(
        val => val._id === address.recordMaintained);
      if (found) {
        address.recordMaintained = found[0];
      }
    });
  }

  /*   getrecordMaintained() {
      const found =  environment.RECORD_MAINTAINED.filter(
          val => val._id === this.practiceProfileInfo.recordMaintained );
      if (found) {
        this.practiceProfileInfo.recordMaintained = found[0];
      }
          console.log(this.practiceProfileInfo.recordMaintained);
    } */

  getAddressList() {
    //const condition = { userId: this.currentUser._id };
    const condition = { userId: this.userId };
    this.addressService.getAddressWithDetails({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.addressList = data.data;
            this.practiceId = this.addressList[0]._id;
            this.practiceName = this.addressList[0].practiceName;
            this.getRadiograph();
            this.getrecordMaintained();
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  getRatingsCount() {
    const condition = {
      practiceId: { $eq: this.practiceProfileInfo._id },
      ratedBy: { $eq: environment.USER_TYPE.STAFF },
      status: environment.RATING_STATUS.DONE
    };

    this.ratingService.getRatingsCount({ condition: condition }).subscribe(async data => {
      if (data.status === 200) {
        if (data.data) {
          this.ratingCount = data.data;
        }
      } else {
        this.globalService.error();
      }
    }, error => {
      this.globalService.error();
    });
  }

  numToArrConverter(i: number) {
    return new Array(i);
  }

  /*   getAlloffers() {
      const condition = {
        staffId: this.currentUser._id,
        status      :  {
                          '$in' : [
                                    environment.OFFER_STATUS_NEW.OFFER,
                                    environment.OFFER_STATUS_NEW.DECLINE,
                                    environment.OFFER_STATUS_NEW.CONTRACT,
                                  ]
                       },
      };
  
      this.offerService.getAllOffers({ condition}).subscribe( data => {
        if (data && data.status === 200) {
          if (data.data.length > 0) {
            let isReturn = false;
            this.sendOfferList = data.data.map(  (offer, index) => {
              if (index === (data.data.length - 1)) {
                isReturn = true;
              };
              if(offer.jobPostId && offer.jobPostId._id) {
                return offer.jobPostId._id;
              }
            });
            if(isReturn) {
              this.getJobs();
            }
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      })
    } */

  getJobs() {
    const condition = {
      // $or: [
      //   {status : environment.JOB_STATUS.OPEN},
      //   {status : environment.JOB_STATUS.CLOSED}
      // ],
      status: environment.JOB_STATUS.OPEN,
      draft: false,
      createdBy: this.userId
    };
    this.jobsService.getJobs({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.filterJobList = data.data;
          // this.jobList = data.data;
        

        }
      },
      error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }
  
  getFavoriteList() {
    const condition = {
      userId : this.currentUser._id,
      type :  environment.FAVORITE_TYPE.PRACTICE,
      favoriteId :  this.practiceProfileInfo._id
    };
    this.favoriteService.getFavoriteJob({condition: condition}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length) {
            this.favorite = data.data[0];
            this.isFavorite = true;
          } else{
            this.isFavorite = false;
          }
        }
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }
  addFavorite() {
    if (this.isFavorite) {
      this.removeFavorite();
      this.toastr.success('Removed From Favorites.', 'Success');
      return false;
    }
    this.favorite.userId = this.currentUser._id;
    this.favorite.type = environment.FAVORITE_TYPE.PRACTICE;
    this.favorite.favoriteId = this.practiceProfileInfo._id;
    this.favoriteService.addFavorite(this.favorite).subscribe(
      data => {
        if (data.status === 200) {
          this.favorite = data.data;
          this.isFavorite = true;
          this.toastr.success('Added To Favorites.', 'Success');
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

  removeFavorite() {
    this.favoriteService.removeFavorite({_id: this.favorite._id }).subscribe(
      data => {
        if (data.status === 200) {
          this.favorite = new Favorite();
          this.isFavorite = false;
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
  filterJob(event,name){
    this.practiceId = event.id;
    this.practiceName = name;
  }

  checkWebsiteURL(link){
    const linkAddress = link.split('.')
    let str = linkAddress[0].substring(0,3)
    if(str === "htt"){
      return link;
    }else{
       return 'https://'+link;
    }
  }
  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }
}
