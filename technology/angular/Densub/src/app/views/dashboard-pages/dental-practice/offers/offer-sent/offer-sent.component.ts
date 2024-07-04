import { Component, OnInit, ViewChild} from '@angular/core';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { environment } from '../../../../../../environments/environment';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { OfferFilter } from '../offer-filter';
import * as moment from 'moment';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';

@Component({
  selector: 'app-offer-sent',
  templateUrl: './offer-sent.component.html',
  styleUrls: ['./offer-sent.component.scss']
})

export class OfferSentComponent implements OnInit {
  offerList = [];
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
  constructor(
    private globalService: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtService: JwtService,
    private offerService: OfferService,
    private firebaseService: FirebaseService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;


    // this.setOrder('practiceOfferTime');
  }

  ngOnInit() {
    this.globalService.topscroll();
    this.setOrder('createdAt');
    if (savedFilters.practice.offerSent) {
      this.dataFilter = savedFilters.practice.offerSent;
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
    savedFilters.practice.offerSent = this.dataFilter;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    savedFilters.practice.offerSent = null;
    this.setDataFilter = this.dataFilter = new OfferFilter();
    // this.setDataFilter = { firstName: '' };
  }

  getOffers() {
    const condition = {
      status:{ $in : [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.EXPIRED , environment.OFFER_STATUS_NEW.DECLINE]},
      practiceId  : this.currentUser._id,
      sendOfferByPractice : true,
      contractStatus: {$exists: false}
    };
    // const sort = {
    //   createdAt: -1
    // }; , sort
    this.offerService.getAllOffers({ condition  }).subscribe(
      data => {
        if (data.status === 200) {
          this.offerList = data.data;
          // this.setOrder('createdAt');
          // console.log(this.offerList);
          this.getAllNotifications();
          this.setFilter();
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
    }  else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-secondary">Expired</span>';
    } else {
      if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary">Counter offer received</span>';
      } else {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      }
    }
  }

}
