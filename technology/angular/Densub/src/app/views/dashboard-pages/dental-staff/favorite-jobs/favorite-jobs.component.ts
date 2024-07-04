import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../../../shared-ui/service/global.service';
import { JobsService } from '../../dental-practice/jobs/job-posts/jobs.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { JwtService } from '../../../../shared-ui/service/jwt.service';
import { FavoriteService } from '../../../../shared-ui/service/favorite.service';
import { environment } from '../../../../../environments/environment';
import { Favorite } from '../../../../shared-ui/staff-list/favorite.model';
import { currentUser } from '../../../../layouts/home-layout/user.model';
import { Filter } from '../../../../shared-ui/staff-list/staff-filter';
import { OfferService } from '../../../../shared-ui/service/offer.service';

@Component({
  selector: 'app-favorite-jobs',
  templateUrl: './favorite-jobs.component.html',
  styleUrls: ['./favorite-jobs.component.scss']
})
export class FavoriteJobsComponent implements OnInit {
  favoriteList: any = [];
  currentUser: currentUser = new currentUser;
  filterJobList: Filter = new Filter;
  favorite: Favorite = new Favorite();
  reverse = false;
  itemsPerPage = 10;
  jobTypes = environment.JOB_TYPE;
  sendOfferList: any = [];
  offerStatus: any = environment.OFFER_STATUS_NEW;
  paymentMethod: any = environment.PAYEMENT_METHOD;
  constructor(
    private globalService: GlobalService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private jwtService: JwtService,
    private favoriteService: FavoriteService,
    private offerService: OfferService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
   }

  ngOnInit() {
    this.globalService.topscroll();
    this.getAlloffers() ;
    // this.getFavoriteList();
  }

  getAlloffers() {
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
        this.sendOfferList = data.data;
           this.getFavoriteList();
        /* if (data.data.length > 0) {
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
            this.getFavoriteList();
          }
        } else {
          this.getFavoriteList();
        } */
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    });
  }

  getFavoriteList() {
    this.spinner.show();
    const condition = {
      userId: this.currentUser._id,
      type: environment.FAVORITE_TYPE.JOB
    };
    this.favoriteService.getFavoriteJob({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList = data.data;
          var self = this;
          this.favoriteList = this.favoriteList.filter( value => {
            const offerIndex = self.sendOfferList.map( value => value.jobPostId._id).indexOf(value.favoriteId._id);
              /* if(offerIndex > -1) {
                value.favoriteId['isApplied'] = true;
              } */
              if (offerIndex > -1) {
                if ( self.sendOfferList[offerIndex].sendOfferByPractice &&
                    self.sendOfferList[offerIndex].status === self.offerStatus.OFFER) {
                      value.favoriteId['isApplied'] = 'Received Offer';
                } else if( (!self.sendOfferList[offerIndex].sendOfferByPractice) &&
                  self.sendOfferList[offerIndex].status === self.offerStatus.OFFER) {
                    value.favoriteId['isApplied'] = 'Applied';
                  }
                   /* else if(self.sendOfferList[offerIndex].status === self.offerStatus.CONTRACT) {
                    value.favoriteId['isApplied'] = 'Contract';
                  } */
                   else if(self.sendOfferList[offerIndex].status === self.offerStatus.DECLINE) {
                    value.favoriteId['isApplied'] = 'Decline';
                  }
              }
              return (value.favoriteId);
          });
          /*             const offerIndex = self.sendOfferList.indexOf(value._id);
              if(offerIndex > -1) {
                job['isApplied'] = true;
              } */
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
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

  removeFavorite(favorite, index) {
    this.favoriteService.removeFavorite({_id: favorite._id }).subscribe(
      data => {
        if (data.status === 200) {
          this.favoriteList.splice(index, 1);
          this.toastr.success('Job has been removed.', 'Success');
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
}
