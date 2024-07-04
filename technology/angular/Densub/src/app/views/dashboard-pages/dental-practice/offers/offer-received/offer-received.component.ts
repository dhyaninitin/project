import { Component, OnInit, OnDestroy } from '@angular/core';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { environment } from '../../../../../../environments/environment';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';
import { OfferFilter } from '../offer-filter';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-received',
  templateUrl: './offer-received.component.html',
  styleUrls: ['./offer-received.component.scss']
})
export class OfferReceivedComponent implements OnInit,OnDestroy {
    offerList = [];
    // subscription:Subscription;
    order = 'createdAt';
    reverse = false;
    itemsPerPage = 10;
    currentUser: currentUser = new currentUser;
    jobLabel: any = environment.JOB_LABEL;
    dataFilter: OfferFilter = new OfferFilter();
    setDataFilter: any;
    jobTypes: any = environment.JOB_TYPE;
    datePickerConfig: any = {
      allowMultiSelect: false,
      disableKeypress: true,
      // min: moment(new Date()).format('MMM DD,YYYY'),
      format: 'MMM DD,YYYY'
    };
    getUnreadNotifications: any = [];
    constructor(
      private globalService: GlobalService,
      private toastr: ToastrService,
      private spinner: NgxSpinnerService,
      private jwtService: JwtService,
      private offerService: OfferService,
      private firebaseService: FirebaseService
    ) {
      this.currentUser = this.jwtService.currentLoggedUserInfo;
      this.globalService.topscroll();
      this.setOrder('createdAt');
    }

    ngOnInit() {
      if (savedFilters.practice.offerReceived) {
        this.dataFilter = savedFilters.practice.offerReceived;
        this.dataFilter.jobPostId.jobDate = (this.dataFilter.jobPostId.jobDate) ?
                this.dataFilter.jobPostId.jobDate :
                (new OfferFilter()).jobPostId.jobDate;
      }
      this.getOffers();
    }

    setOrder(value: string) {
      if (this.order === value) {
        this.reverse = !this.reverse;
      }
      this.order = value;
    }

      /** This method will filter user behalf criteria */
  setFilter() {
    savedFilters.practice.offerReceived = this.dataFilter;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    savedFilters.practice.offerReceived = this.dataFilter;
    this.setDataFilter = this.dataFilter = new OfferFilter();
    // this.setDataFilter = { firstName: '' };
  }


    getOffers() {
      const condition = {
        status: { $in : [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE]},
        practiceId  : this.currentUser._id,
        sendOfferByPractice : false,
        contractStatus: {$exists: false}
      };
      // const sort = {
      //   updatedAt: -1
      // }; , sort
      this.offerService.getAllOffers({ condition  }).subscribe(
        data => {
          if (data.status === 200) {
            this.offerList = data.data;
            this.getAllNotifications();
            this.setFilter();
            // this.setOrder('updatedAt');
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

    getAllNotifications() {
      const self = this;
      const notifications = this.firebaseService.getAllNotification();
      notifications.on('value', function(snapshot) {
         const values = snapshot.val();
         if (values) {
           let convertObjToArray = Object.entries(values);
            //  convertObjToArray;
            convertObjToArray.forEach((value) => {
               // -----  Count Unread Notification -------------------------------
               if ( environment.notificationStatus.UNREAD === value[1]['status']) {
                 const index = self.offerList.findIndex(offer => {
                  //  console.log(offer._id , value[1]['offerId']);
                    return (offer._id === value[1]['offerId'] && offer.practiceId._id === value[1]['receiverId']
                            && offer.staffId._id === value[1]['senderId']);
                  })
                  if(index > -1) {
                    self.offerList[index]['updatedOffer'] = true;
                    console.log(index,self.offerList);
                  }
               }
            })
              /* ------------------------------------------------------------ */
         }
       });
     }

    getStatus(currentOffer) {
      if (currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
        return '<span class="badge badge-danger">Declined</span>';
      } else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
        return '<span class="badge badge-secondary">Expired</span>';
      } else {
        if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
          return '<span class="badge badge-primary">Received Initial Offer</span>';
        } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
          return '<span class="badge badge-warning">Waiting for Approval</span>';
        } else {
          return '<span class="badge badge-primary">Final offer received</span>';
        }
      }
    }

  ngOnDestroy(){
    // this.subscription.unsubscribe();
  }
}
