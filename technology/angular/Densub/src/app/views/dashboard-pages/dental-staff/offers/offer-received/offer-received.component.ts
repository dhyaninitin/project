import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { environment } from '../../../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { OfferFilter } from '../offer-filter';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { savedFilters } from '../../../../../shared-ui/global/allFilters';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import * as moment from 'moment';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { AddressService } from '../../../../../shared-ui/service/address.service';
import { JobsService } from '../../../dental-practice/jobs/job-posts/jobs.service';
import { Favorite } from '../../../../../shared-ui/staff-list/favorite.model';
import { FavoriteService } from '../../../../../shared-ui/service/favorite.service';
import { NgxCarousel } from 'ngx-carousel';

@Component({
  selector: 'app-offer-received',
  templateUrl: './offer-received.component.html',
  styleUrls: ['./offer-received.component.scss']
})
export class OfferReceivedComponent implements OnInit {
  @ViewChild('offerJobModal', { static: false })
  public offerJobModal: ModalDirective;

  @ViewChild('offerJobModal1', { static: false })
  public offerJobModal1: ModalDirective;

  @ViewChild('declineJobModal', { static: false })
  public declineJobModal: ModalDirective;

  @ViewChild('deleteOfferModal', { static: false }) public deleteOfferModal: ModalDirective;
  @ViewChild('errorModal', { static: false }) public errorModal: ModalDirective;
  @ViewChild('viewInvitationDeclinedModal', { static: false }) public viewInvitationDeclinedModal: ModalDirective;
  

  offerViewLink = '#/staff/offer-details';
  offerList = [];
  public destroyed = new Subject<any>();
  reverse = false;
  itemsPerPage = 10;
  totalItem = 0;
  jobTypes = environment.JOB_TYPE;
  public isCollapsed = false;
  userTypes = environment.USER_TYPE;
  jobLabel: any = environment.JOB_LABEL;
  currentUser: currentUser = new currentUser;
  dataFilter: OfferFilter = new OfferFilter();
  setDataFilter: any;
  profileStatus = environment.PROFILE_STATUS;
  datePickerConfig: any = {
    allowMultiSelect: false,
    disableKeypress: true,
    // min: moment(new Date()).format('MMM DD,YYYY'),
    format: 'MMM DD,YYYY'
  };
  p=1;
  sendOffer = {
    amount: 0,
    message: '',
    startTime: '',
    endTime: ''
  };
  offerId = '';
  paymentMethod = environment.PAYEMENT_METHOD;

  offerDetails: any = new Offer();
  isDeleteOffer: Boolean = false;
  offerType = environment.OFFER_TYPE;
  practiceNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
  notificationType = environment.NOTIFICATION_TYPE;
  jobStatus = environment.OFFER_STATUS_NEW;
  declinedMessage = '';
  showButtonCond = {
    acceptOffer: false,
    declineOffer: false,
    counterOffer: false,
    // finalOffer : false,
    waitingMsg: false,
    declineMsg: false,
    deleteOffer: false,
    expiredMsg: false,
  };
  errorModalDetails = {
    title: '',
    message: '',
    notAvailable: false,
    isAlreadyBooked: false,
    isSendOfferPreviously: false,
    type: ''
  };
  ckeConfig: any = {
    //allowedContent: false,
    forcePasteAsPlainText: true,
    height: 200,
    toolbarGroups: [
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list'] },
    ],
    removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  };
  notification: any = new Notification();
  address: any;
  practicesIds: any = [];
  jobDetails;
  jobsCounts = 0;
  hiredCounts = 0;
  offerDecline: any = { reason: '', declineTime: '', cancelBy: '' };
  isFavorite: Boolean = false;
  favorite: Favorite = new Favorite();
  public carouselOne: NgxCarousel;


  constructor(
    private offerService: OfferService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private globalService: GlobalService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private router: Router,
    private favoriteService: FavoriteService,
    private addressService: AddressService,
    private jobsService: JobsService,
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    // this.route.params.subscribe(res => {
    //   this.offerId = res.offerId;
    // });
  }

  ngOnInit() {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    if (savedFilters.staff.offerReceived) {
      this.dataFilter = savedFilters.staff.offerReceived;
      this.dataFilter.jobPostId.jobDate = (this.dataFilter.jobPostId.jobDate) ?
        this.dataFilter.jobPostId.jobDate :
        (new OfferFilter()).jobPostId.jobDate;
    }
    // this.router.events.pipe(
    //   filter((event: RouterEvent) => event instanceof NavigationEnd),
    //   pairwise(),
    //   filter((events: RouterEvent[]) => events[0].url === events[1].url),
    //   startWith('Initial call'),
    //   takeUntil(this.destroyed)
    // ).subscribe(() => {
    //   this.getOfferDetails();
    // });
    this.getOfferList(this.p,this.itemsPerPage);

    this.carouselOne = {
      grid: {xs: 2, sm: 2, md: 2, lg: 2, all: 0},
      slide: 2,
      speed: 400,
      interval: 4000,
      point: {
        visible: false,
      },
      load: 2,
      touch: true,
      loop: false,
      custom: 'banner'
    }

  }
  public myfunc(event: Event) {
  }
  checkAndUpdateNotification() {
    const receiverId = this.offerDetails.staffId._id;
    const senderId = this.offerDetails.practiceId._id;
    const offerId = this.offerDetails._id;
    const status = environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
  }
  setId(id) {
    this.offerId = id;
    this.getOfferDetails();
  }
  getOfferDetails() {
    console.log(this.offerId);
    this.spinner.show();
    const condition = {
      _id: this.offerId,
      $or: [
        { status: environment.OFFER_STATUS_NEW.OFFER },
        { status: environment.OFFER_STATUS_NEW.DECLINE },
      ]
    };
    this.offerService.getOffer({ condition: condition }).subscribe(
      data => {
        console.log("hello" + data.status);
        if (data.status === 200) {
          if (data.data) {
            this.offerDetails = data.data;
            console.log(this.offerDetails);
            this.checkAndUpdateNotification();
            this.setButtonCondition();
            console.log(this.offerDetails);
            this.sendOffer.amount = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount) ?
              this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount :
              ((this.paymentMethod.HOURLY) ? this.offerDetails.jobPostId.desiredHourlyRate :
                this.offerDetails.jobPostId.desiredSalaryRate);

            this.sendOffer.startTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime) ?
              this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime :
              this.offerDetails.jobPostId.startTime;

            this.sendOffer.endTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime) ?
              this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime :
              this.offerDetails.jobPostId.endTime;
          } else {
            this.router.navigate(['staff/dashboard']);
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        this.spinner.hide();
      },
      error => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  closeModel() {
    this.offerJobModal.hide();
    this.declineJobModal.hide();
    this.offerJobModal1.hide();
  }

  /** This method will filter user behalf criteria */
  setFilter() {
    savedFilters.staff.offerReceived = this.dataFilter;
    this.setDataFilter = Object.assign({}, this.dataFilter);
  }

  /** This method will reset filter criteria*/
  resetFilter() {
    savedFilters.staff.offerReceived = null;
    this.setDataFilter = this.dataFilter = new OfferFilter();
    // this.setDataFilter = { firstName: '' };
  }

  declineOffer() {
    this.spinner.show();
    // ---- For Notification
    console.log(this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy']);
    console.log(this.userTypes.PRACTICE)
    if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] === this.userTypes.PRACTICE) {
      this.practiceNotification['sentOffer'] = 1;
    } else {
      this.practiceNotification['receivedOffer'] = 1;
    }
    this.offerDetails.status = environment.OFFER_STATUS_NEW.DECLINE;
    this.offerDetails.offerDecline = {
      declineTime: new Date(),
      reason: this.declinedMessage,
      declineBy: environment.USER_TYPE.STAFF
    };
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.practiceId._id,
            this.offerDetails.jobPostId._id);
          this.setButtonCondition();
          this.sendNotification('decline');
          this.closeModel();
          this.toastr.success(
            'Offer has been declined.',
            'Success'
          );
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
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

  getOfferList(p,itemsPerPage) {
    ///this.spinner.show();
    const options = {
      p,
      itemsPerPage
    }
    const condition = {
      status: { $in: [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.CONTRACT, environment.OFFER_STATUS_NEW.APPLYED, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE] },
      staffId: this.currentUser._id,
      sendOfferByPractice: true,
      // contractStatus: { $exists: false }
    };

    // const sort = {
    //   updatedAt: -1
    // }; , sort

    this.offerService.getAllOffers({ condition, options }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.offerList = data.data;
            this.totalItem = data.count;
            this.addStatus();
            console.log("offerList::", data.data)
            this.getAddressListForOffer();
            this.getAllNotifications();
            this.setFilter();
          }
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
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

  getAddressListForOffer() {
    // const condition = { userId: element.staffId._id };
    this.addressService.getAddressWithDetails({ }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.address = data.data;            
            this.mergeAddress();
          }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  mergeAddress(){
    this.callStackForCounts();
    this.offerList.forEach(elementOffer => {
      //this.practicesIds.push(elementOffer.practiceId._id);
      this.address.forEach(elementAddress => {
        if(elementOffer.practiceName._id === elementAddress._id){
          elementOffer.practiceAddress = elementAddress;
        }
      });
    });
  }

  callStackForCounts(){
    this.offerList.forEach(elementOffer => {
      this.practicesIds.push(elementOffer.practiceId._id);
    });
    this.practicesIds = this.practicesIds.filter((v, i, a) => a.indexOf(v) === i); 
    this.getJobDetails();
    this.getAlloffers();
  }

  addStatus(){
    this.offerList.forEach(offer=>{
      if(offer.status === environment.OFFER_STATUS_NEW.EXPIRED){
        offer.practiceId.tagStatus = 'new';
      }else if(offer.status === environment.OFFER_STATUS_NEW.DECLINE){
        offer.practiceId.tagStatus = 'declined';
      }else{
        if((offer.offerStatus === environment.OFFER_TYPE.INITIAL) && (offer.status === environment.OFFER_STATUS_NEW.APPLYED || offer.status === environment.OFFER_STATUS_NEW.CONTRACT )){
          offer.practiceId.tagStatus = 'applied';
        }else if (offer.offerStatus === environment.OFFER_TYPE.INITIAL) {
          offer.practiceId.tagStatus = 'new';
        }else{
          offer.practiceId.tagStatus = 'applied';
        }
      }
    })
  }
  
  getJobDetails() {
    this.spinner.show();
    const condition = {
      draft: false,
      createdBy: {$in : this.practicesIds}
    };
    this.jobsService.getJobsWithDetails({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.jobDetails = data.data;
            this.mergeJobCountDetails();
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
      }
    );
  }
  mergeJobCountDetails(){
    this.offerList.forEach(practice => {
     this.jobsCounts = 0;
      this.jobDetails.forEach(jobDetails => {
        if(practice.practiceId._id === jobDetails.createdBy._id){
          this.jobsCounts++;
        }
      });
      practice.jobsPosted = this.jobsCounts;
    });
  }

  getAlloffers() {
    this.offerList.forEach(practice => {
      const condition = { 
        practiceId :practice.practiceId._id,
        contractStatus: { $exists: true, $ne: 'revoke' },
      };
      this.offerService.getAllOffers({ condition}).subscribe( data => {
        if (data && data.status === 200) {
           practice.hiredCounts = data.data.length;
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      })
    })
  }

  getAllNotifications() {
    console.log(this.offerList)
    const self = this;
    const notifications = this.firebaseService.getAllNotification();
    notifications.on('value', function (snapshot) {
      const values = snapshot.val();
      if (values) {
        let convertObjToArray = Object.entries(values);
        //  convertObjToArray;
        convertObjToArray.forEach((value) => {
          // -----  Count Unread Notification -------------------------------
          if (environment.notificationStatus.UNREAD === value[1]['status']) {
            const index = self.offerList.findIndex(offer => {
              if(offer._id === value[1]['offerId'] && offer.practiceId._id === value[1]['senderId']
              && offer.staffId._id === value[1]['receiverId'] && value[1]['status'] === 'unread'){
                  offer.notifyStatus = 'unread';
              }else{
                offer.notifyStatus = 'read';
              }
              return (offer._id === value[1]['offerId'] && offer.practiceId._id === value[1]['senderId']
                && offer.staffId._id === value[1]['receiverId']);
            })
            if (index > -1) {
              self.offerList[index]['updatedOffer'] = true;
            }
          }
        })
        /* ------------------------------------------------------------ */
      }
    });
  }

  capitalizeWords(text){
    return text.replace(/(?:^|\s)\S/g,(res)=>{ return res.toUpperCase();})
  };

  getStatus(currentOffer) {   
    if (currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Declined by '+ this.capitalizeWords(currentOffer.offerDecline.declineBy)+'</span>';
    } else if (currentOffer.jobPostId.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-secondary">Job is no longer available</span>';
    } else {
      if((currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) && (currentOffer.status === environment.OFFER_STATUS_NEW.APPLYED || currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT )){
        return '<span class="badge badge-primary">Applied</span>';
      }
      else if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        if(currentOffer.notifyStatus === environment.notificationStatus.READ){
          return '<span class="badge badge-primary">Viewed</span>';
        }else{
          return '<span class="badge badge-primary">New</span>';
        }
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary">Applied</span>';
      }else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
        return '<span class="badge badge-primary">Applied</span>';
      }else {
        return '<span class="badge badge-warning">Recevied Final Offer</span>';
      }
    }
  }

  viewReason(offer){
    this.offerDecline = offer.offerDecline;
    this.viewInvitationDeclinedModal.show();
  }
  sendNotification(type = '') {
    if (!type) {
      return false;
    }
    // const checkType = ['accept'];
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.offerDetails.jobPostId.jobTitle.toString());
    const jobId = this.offerDetails.jobPostId._id;
    const message = this.declinedMessage.trim();
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    // console.log((checkType.indexOf(type) > -1));
    const id = this.offerDetails._id;
    // const id = (checkType.indexOf(type) > -1) ? this.offerDetails._id : this.offerDetails.jobPostId._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.offerDetails.practiceId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: notification[type].practiceLink + id,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      practice: this.practiceNotification,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
    this.practiceNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
  }
  sendOfferType() {
    let message = '';
    let isofferType = '';
    this.spinner.show();
    // if (this.showButtonCond.counterOffer){
    message = 'Counter offer has been sent.';
    // this.offerDetails.offerStatus = environment.OFFER_TYPE.COUNTER;
    isofferType = 'counter';
    // }
    // else {
    //   message = 'Final Offer Send Succesfully.';
    //   this.offerDetails.offerStatus = environment.OFFER_TYPE.FINAL;
    //   isofferType = 'final';
    // }
    this.offerDetails.offerSteps[isofferType].message = this.sendOffer.message;
    this.offerDetails.offerSteps[isofferType].amount = this.sendOffer.amount;
    this.offerDetails.offerSteps[isofferType].startTime = this.sendOffer.startTime;
    this.offerDetails.offerSteps[isofferType].endTime = this.sendOffer.endTime;

    if (this.isDeleteOffer) {
      this.offerDetails.offerStatus = this.offerType.INITIAL;
      this.offerDetails.offerSteps[isofferType].offerTime = '';
      this.offerDetails.offerSteps[isofferType].offerBy = '';
    } else {
      // ---- For Notification
      if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] === this.userTypes.PRACTICE) {
        this.practiceNotification['sentOffer'] = 1;
      } else {
        this.practiceNotification['receivedOffer'] = 1;
      }
      this.offerDetails.offerSteps[isofferType].offerTime = new Date();
      this.offerDetails.offerSteps[isofferType].offerBy = environment.USER_TYPE.STAFF;
      this.offerDetails.offerStatus = this.offerType.COUNTER;
    }


    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          if (this.isDeleteOffer) {
            this.deleteOfferModal.hide();
            message = 'Offer has been deleted.';
            this.isDeleteOffer = false;
            //--- DeleteMessageRecipents ----
            this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.practiceId._id,
              this.offerDetails.jobPostId._id, 'delete');
            //-------------------------------
            // ----- delete Notification
            this.firebaseService.getAndDeleteNotification(
              this.offerDetails.staffId._id, this.offerDetails.practiceId._id,
              this.offerDetails._id, this.notificationType.counterOffer
            );
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', false);
          } else {
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
            this.sendNotification('counter');
          }
          // if(this.showButtonCond.counterOffer) {
          // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
          // this.sendNotification('counter');
          // }
          // else {
          //   this.sendNotification('final');
          // }
          this.setButtonCondition();
          this.closeModel();
          this.toastr.success(
            message,
            'Success'
          );
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
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
  setButtonCondition() {
    console.log('Set button condition');
    this.showButtonCond = {
      acceptOffer: (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER
        && (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)),

      declineOffer: (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)),

      counterOffer: (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)
        && this.offerDetails.sendOfferByPractice
        && (environment.OFFER_TYPE.INITIAL === this.offerDetails.offerStatus)
      ),
      deleteOffer: (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF) &&
        this.offerDetails.offerStatus === this.offerType.INITIAL),


      // finalOffer :   (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
      //                 (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)
      //                 && !this.offerDetails.sendOfferByPractice
      //                 && (environment.OFFER_TYPE.COUNTER === this.offerDetails.offerStatus)
      //                  ),

      waitingMsg: (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF)),


      declineMsg: (this.offerDetails.status === environment.OFFER_STATUS_NEW.DECLINE),
      expiredMsg: (this.offerDetails.status === environment.OFFER_STATUS_NEW.EXPIRED)
    };
    console.log(this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER);

  }
  timeValidation(type) {
    const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
    const startTime = this.sendOffer.startTime;
    const endTime = this.sendOffer.endTime;
    if (endTime && startTime && (endTime !== startTime)) {
      if (startTime > endTime) {
        if (type === 'startTime') {
          this.sendOffer[otherType] = this.sendOffer[type];
        } else {
          setTimeout(() => {
            this.sendOffer[type] = this.sendOffer[otherType];
          }, 200);
        }
      }
    } else {
      this.sendOffer[otherType] = this.sendOffer[type];
    }
  }
  checkCalendar(type) {
    console.log(type);
    this.spinner.show();
    console.log(this.offerDetails);
    console.log(this.offerDetails.staffId);
    const jobDate = this.offerDetails.jobPostId.jobDate;
    const format = 'hh:mm';
    let offerStartTime, offerEndTime;
    if (type === 'acceptOffer') {
      offerStartTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime;
      offerEndTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime;
    } else if (type === 'counterOffer') {
      console.log(this.sendOffer);
      offerStartTime = this.sendOffer.startTime;
      offerEndTime = this.sendOffer.endTime;
    }
    this.errorModalDetails = {
      title: '',
      message: '',
      notAvailable: false,
      isAlreadyBooked: false,
      isSendOfferPreviously: false,
      type: type
    };
    if (this.offerDetails.staffId.availableDays) {
      for (let i = 0; i < this.offerDetails.staffId.availableDays.length; i++) {
        console.log(this.offerDetails);
        const calendarDate = this.offerDetails.staffId.availableDays[i];
        if (moment(calendarDate.start).isSame(moment(jobDate), 'date')) {
          if (calendarDate.available) {
            // -> Convert it  in minutes
            const calendarStartTime = moment(moment(calendarDate.startTime, ['h:mm A']).format('HH:mm'), format);
            const calendarEndTime = moment(moment(calendarDate.endTime, ['h:mm A']).format('HH:mm'), format);
            const startTime = moment(moment(offerStartTime).format('HH:mm'), format);
            const endTime = moment(moment(offerEndTime).format('HH:mm'), format);
            // -----
            const condition = (
              (
                (startTime.isSame(calendarStartTime) ||
                  startTime.isBetween(calendarStartTime, calendarEndTime)) &&
                (endTime.isSame(calendarEndTime) ||
                  endTime.isBetween(calendarStartTime, calendarEndTime))
              ) ||
              (calendarDate.startTime === '00:00' && calendarDate.endTime === '00:00')
            );
            if (condition) {
              this.checkBooking(offerStartTime, offerEndTime, jobDate, type);
              break;
            } else {
              this.spinner.hide();
              if (type === 'counterOffer') {
                this.offerJobModal.hide();
              }
              this.errorModalDetails = {
                title: 'Update Calendar',
                message: 'Update your availability to apply for this job',
                notAvailable: true,
                isAlreadyBooked: false,
                isSendOfferPreviously: false,
                type: type
              };
              this.errorModal.show();
            }
          } else {
            this.spinner.hide();
            if (type === 'counterOffer') {
              this.offerJobModal.hide();
            }
            this.errorModalDetails = {
              title: 'Update Calendar',
              message: 'Update your availability to apply for this job',
              notAvailable: true,
              isAlreadyBooked: false,
              isSendOfferPreviously: false,
              type: type
            };
            this.errorModal.show();
            break;
          }
        }
      }
    } else {
      console.log("yes");
      this.checkBooking(offerStartTime, offerEndTime, jobDate, type);
    }
  }

  checkBooking(offerStartTime, offerEndTime, jobDate, type) {
    const condition = {
      staffId: this.currentUser._id,
      // _id: {$ne:''}
    };

    const matchDateTime = {
      startTime: offerStartTime,
      endTime: offerEndTime,
      jobDate: jobDate
    };
    this.offerService.checkBooking({ condition, matchDateTime }).subscribe(
      data => {
        if (data.status = 200) {
          if (data.data.isAlreadyBooked) {
            this.spinner.hide();
            if (type === 'counterOffer') {
              this.offerJobModal.hide();
            }
            this.errorModalDetails = {
              title: 'Already Booked',
              message: 'You are already booked at this time',
              notAvailable: false,
              isAlreadyBooked: true,
              isSendOfferPreviously: false,
              type: type
            };
            this.errorModal.show();
          } else if (data.data.isAlreadyBooked) {
            this.spinner.hide();
            if (type === 'counterOffer') {
              this.offerJobModal.hide();
            }
            this.errorModalDetails = {
              title: 'Already Send Offer',
              message: 'You have already send offer at this time',
              notAvailable: false,
              isAlreadyBooked: false,
              isSendOfferPreviously: true,
              type: type
            };
            this.errorModal.show();
          } else {
            if (type === 'acceptOffer') {
              console.log('I am in accept Offer');
              this.acceptOffer();
            } else if (type === 'counterOffer') {
              console.log('I am in send Counter Offer');
              this.sendOfferType();
            }
          }
        } else {
          this.spinner.hide();
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }
  removedChangeJobStatus() {
    this.practiceNotification['contract'] = 1;
    this.setButtonCondition();
    this.sendNotification('accept');
    this.toastr.success('Application has been sent successfully.', 'Success');
  }
  acceptOffer() {
    this.spinner.show();
    this.offerDetails.status = environment.OFFER_STATUS_NEW.CONTRACT;
    this.offerDetails.contractStartTime = new Date();
    this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
    // To check is the offer is send by practice so to change the amount
    // const ischeckIniOfferPractice = ((this.offerDetails.offerStatus == this.offerType.INITIAL) && this.offerDetails.sendOfferByPractice);



    // this.offerDetails['finalRate'] =  (this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount) ?
    //                                 this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount   :
    //                                  ((this.paymentMethod.HOURLY === this.offerDetails.jobPostId.paymentMethod) ?
    //                                  this.offerDetails.jobPostId.desiredHourlyRate :
    //                                  this.offerDetails.jobPostId.desiredSalaryRate);

    this.offerDetails['finalRate'] = this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          // this.changeJobStatus();
          setTimeout(() => {
            this.router.navigate(['staff/assignments/details', this.offerDetails._id]);
          }, 1000);
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
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
  tempStr: any = '';
  onEditorChange() {
    this.tempStr = this.sendOffer.message;
    if ((this.tempStr === null) || (this.tempStr === '')) {
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      return true;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace(/(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      if (this.tempStr.length > 1000) {
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning');
        this.tempStr = this.tempStr.slice(0, 1000);
        this.sendOffer.message = this.tempStr;
        return false;
      }
    }
  }

  //add invited job as favorite new function
  addFavorite(jobDetail: any) {
    if (this.isFavorite) {
      this.removeFavorite();
      return false;
    }
    this.favorite.userId = this.currentUser._id;
    this.favorite.type = environment.FAVORITE_TYPE.JOB;
    this.favorite.favoriteId = jobDetail._id;
    this.favoriteService.addFavorite(this.favorite).subscribe(
      data => {
        if (data.status === 200) {
          this.favorite = data.data;
          this.isFavorite = true;
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

  // getFavoriteList() {
  //   const condition = {
  //     userId : this.currentUser._id,
  //     type : environment.FAVORITE_TYPE.JOB,
  //     favoriteId : this.jobDetail._id
  //   };
  //   this.favoriteService.getFavoriteJob({condition: condition}).subscribe(
  //     data => {
  //       if (data.status === 200) {
  //         if (data.data.length) {
  //           this.favorite = data.data[0];
  //           this.isFavorite = true;
  //         } else{
  //           this.isFavorite = false;
  //         }
  //       }
  //       this.spinner.hide();
  //     },
  //     error => {
  //       this.spinner.hide();
  //       this.toastr.error(
  //         'There are some server Please check connection.',
  //         'Error'
  //       );
  //     });
  // }
  
  getPage(page:number){
    this.p = page;
    this.getOfferList(this.p,this.itemsPerPage);
  }

  goToJobDetails(){
    this.offerService.fromInvitation = true;
  }

  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }
}
