import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { filter, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JobsService } from '../../jobs/job-posts/jobs.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { Common } from '../../../../../shared-ui/service/common.service';
import * as moment from 'moment';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
@Component({
  selector: 'app-offer-details',
  templateUrl: './offer-details.component.html',
  styleUrls: ['./offer-details.component.scss']
})
export class OfferDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('offerJobModal', { static: false })
  public offerJobModal: ModalDirective;
  @ViewChild('declineJobModal', { static: false })
  public declineJobModal: ModalDirective;
  @ViewChild('deleteOfferModal', { static: false }) public deleteOfferModal: ModalDirective;
  public destroyed = new Subject<any>();
  offerDetails: any = new Offer();

  jobTypes = environment.JOB_TYPE;
  userTypes = environment.USER_TYPE;
  jobTypeLabel = environment.JOB_LABEL;
  offerType = environment.OFFER_TYPE;
  offerStatus = environment.OFFER_STATUS_NEW;
  paymentMethod = environment.PAYEMENT_METHOD;
  notificationType = environment.NOTIFICATION_TYPE;
  currentUser: currentUser = new currentUser;
  offerId = '';
  isDeleteOffer: Boolean = false;
  // editorConfig: any = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '290px',
  //   translate: 'yes',
  //   enableToolbar: true,
  //   showToolbar: true,
  //   toolbar: [
  //     [
  //       'bold',
  //       'italic',
  //       'underline',
  //       'orderedList',
  //       'unorderedList'
  //     ],
  //   ]
  // };
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
  declinedMessage = '';
  sendOffer = {
    amount: 0 ,
    message: '',
    startTime: '',
    endTime: ''
  };
  showButtonCond = {
    acceptOffer : false,
    declineOffer : false,
    counterOffer : false,
    // finalOffer : false,
    waitingMsg : false,
    declineMsg : false,
    deleteOffer: false,
    expiredMsg: false
  };
  staffNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
  declineStaffList: any = [];

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router,
    private jobsService: JobsService,
    private offerService: OfferService,
    private common: Common,
    private location: Location,
    private globalService: GlobalService,
    ) {
      this.currentUser = this.jwtService.currentLoggedUserInfo;
      this.route.params.subscribe(res => {
        this.offerId = res.offerId;
      });
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd),
      pairwise(),
      filter((events: RouterEvent[]) => events[0].url === events[1].url),
      startWith('Initial call'),
      takeUntil(this.destroyed)
    ).subscribe(() => {
      this.getOfferDetails();
    });
  }

  getOfferDetails() {
    this.spinner.show();
    const condition = {
          _id       : this.offerId,
          status: { $in : [environment.OFFER_STATUS_NEW.OFFER, environment.OFFER_STATUS_NEW.EXPIRED, environment.OFFER_STATUS_NEW.DECLINE]},
          contractStatus: {$exists: false}
    };
    this.offerService.getOffer({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.offerDetails = data.data;
            this.checkAndUpdateNotification();
            this.setButtonCondition();
            this.sendOffer.amount = this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
            this.sendOffer.startTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime;
            this.sendOffer.endTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime;
          } else {
            this.router.navigate(['practice/job-posts']);
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

  checkAndUpdateNotification() {
   const senderId = this.offerDetails.staffId._id;
   const receiverId = this.offerDetails.practiceId._id;
   const offerId = this.offerDetails._id;
   const status =  environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
  }

  setButtonCondition() {
    this.showButtonCond = {
      acceptOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER
                      && (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.STAFF)),

      declineOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
                      (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.STAFF)),

      counterOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
                      (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
                      && !this.offerDetails.sendOfferByPractice
                      && (this.offerType.INITIAL === this.offerDetails.offerStatus)
                      && !(this.isSameTimeAmount(this.offerDetails))

                      ),
        deleteOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
          (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.PRACTICE)
          &&  this.offerDetails.offerStatus === this.offerType.INITIAL ),
      // finalOffer :   (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
      //                 (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
      //                 && this.offerDetails.sendOfferByPractice
      //                 && (this.offerType.COUNTER === this.offerDetails.offerStatus)
      //                 ),

      waitingMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === this.userTypes.PRACTICE)),

        declineMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.DECLINE),
        expiredMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.EXPIRED),
    };
  }

  isSameTimeAmount(offer): Boolean {
    const offerStartTime = moment(offer.offerSteps[offer.offerStatus].startTime).format('hh:mm a');
    const offerEndTime = moment(offer.offerSteps[offer.offerStatus].endTime).format('hh:mm a');
    const jobStartTime = moment(offer.jobPostId.startTime).format('hh:mm a');
    const jobEndTime = moment(offer.jobPostId.endTime).format('hh:mm a');
    const offerAmount = offer.offerSteps[offer.offerStatus].amount;
    const isHourlyMatch = ( this.paymentMethod.HOURLY === offer.jobPostId.paymentMethod &&
                            offer.jobPostId.desiredHourlyRate === offerAmount);
    const isSalaryMatch = ( this.paymentMethod.SALARY === offer.jobPostId.paymentMethod &&
                            offer.jobPostId.desiredSalaryRate === offerAmount);
    if ((offerStartTime === jobStartTime) && (offerEndTime === jobEndTime) && (isHourlyMatch || isSalaryMatch) ) {
      return true;
    } else {
      return false;
    }
  }

  acceptOffer() {
    this.spinner.show();
    this.offerDetails.status = environment.OFFER_STATUS_NEW.CONTRACT;
    this.offerDetails.contractStartTime = new Date();
    this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
    // if(this.offerDetails.offerStatus === this.offerStatus.)
    this.offerDetails['finalRate'] = this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
            if (data.status === 200) {
              this.staffNotification['contract'] = 1;
              this.sendNotification('accept');
              this.removedChangeJobStatus();
              this.declinedOfferList();
              //---Removed to contract status 30 May
              // this.changeJobStatus();
              setTimeout(() => {
                this.router.navigate(['practice/contracts/details', this.offerDetails._id]);
              }, 1000 );
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

  declinedOfferList() {
    const condition = {
          _id: { $ne: this.offerDetails._id },
          jobPostId: this.offerDetails.jobPostId._id,
          $or: [
                  { status: this.offerStatus.OFFER },
                  { status: this.offerStatus.CONTRACT }
            ],
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.declineStaffList = data.data;
          }
          this.declineOtherOffers();
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

  declineOtherOffers() {
    const offerDecline = {
                            reason : 'Job is no longer available',
                            declineTime : moment().toISOString(),
                            declineBy : environment.USER_TYPE.PRACTICE,
                          };
    const updateDetails =  {
        status: this.offerStatus.DECLINE,
        offerDecline : offerDecline
      };
    const condition = {
      _id: { $ne: this.offerDetails._id } ,
      $or: [
              { status: this.offerStatus.OFFER },
              { status: this.offerStatus.CONTRACT }
           ],
      jobPostId: this.offerDetails.jobPostId._id
    };
    this.offerService.updateMultipleOffer({condition , updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('decline' , offerDecline.reason);
        } else {
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
      });
  }

  sendDeclinedNotification(type = '', message) {
    if (!type) {
      return false;
    }
     // offerStatus.DECLINE
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    this.declineStaffList.map( value => {
      const title = value.jobPostId.jobTitle.toString();
      const jobId = value.jobPostId._id;
      const menuCount = (value.sendOfferByPractice) ? ({sentOffer: 0 , receivedOffer : 1, contract: 0 }) :
                                  ({sentOffer: 1 , receivedOffer : 0, contract: 0 } );
      const id = value._id;
      this.notification = {
        senderId    : this.currentUser._id,
        receiverId  : value.staffId._id,
        message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
        redirectLink : notification[type].staffLink + id,
        type : notification[type].type,
        offerId : id,
        jobId : jobId,
        staff: menuCount,
        practice: {sentOffer: 0 , receivedOffer : 0, contract: 0},
        createdAt: currentTime,
        updatedAt: currentTime,
        status : environment.notificationStatus.UNREAD
      };
      this.firebaseService.createNotification(this.notification);
    });
  }

  declineOffer() {
    this.spinner.show();
    if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] ===  this.userTypes.STAFF) {
      this.staffNotification['sentOffer'] = 1;
    } else {
      this.staffNotification['receivedOffer'] = 1;
    }
    this.offerDetails.status = environment.OFFER_STATUS_NEW.DECLINE;
    this.offerDetails.offerDecline = {
        declineTime  : new Date(),
        reason       : this.declinedMessage,
        declineBy    : this.userTypes.PRACTICE
    };
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.staffId._id,
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

  closeModel() {
    this.offerJobModal.hide();
    this.declineJobModal.hide();
  }

  sendOfferType() {
    let message = '';
    this.spinner.show();
    // if (this.showButtonCond.counterOffer){
      message = 'Counter offer has been sent.';
      this.offerDetails.offerSteps.counter.message = this.sendOffer.message;
      this.offerDetails.offerSteps.counter.amount =  this.sendOffer.amount;
      this.offerDetails.offerSteps.counter.startTime =  this.sendOffer.startTime;
      this.offerDetails.offerSteps.counter.endTime =  this.sendOffer.endTime;
      if (this.isDeleteOffer) {
        this.offerDetails.offerStatus = this.offerType.INITIAL;
        this.offerDetails.offerSteps.counter.offerTime =  '';
        this.offerDetails.offerSteps.counter.offerBy =  '';
      } else {
        if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] ===  this.userTypes.STAFF) {
          this.staffNotification['sentOffer'] = 1;
        } else {
          this.staffNotification['receivedOffer'] = 1;
        }
        this.offerDetails.offerSteps.counter.offerTime =  new Date();
        this.offerDetails.offerSteps.counter.offerBy =  this.userTypes.PRACTICE;
        this.offerDetails.offerStatus = this.offerType.COUNTER;
      }
    // }
    // else {
    //   message = 'Final Offer Send Succesfully.';
    //   this.offerDetails.offerSteps.final.message = this.sendOffer.message;
    //   this.offerDetails.offerSteps.final.amount =  this.sendOffer.amount;
    //   this.offerDetails.offerSteps.final.offerTime =  new Date();
    //   this.offerDetails.offerSteps.final.offerBy =  this.userTypes.PRACTICE;
    //   this.offerDetails.offerSteps.final.startTime =  this.sendOffer.startTime;
    //   this.offerDetails.offerSteps.final.endTime =  this.sendOffer.endTime;
    //   this.offerDetails.offerStatus = this.offerType.FINAL;
    // }

    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          if ( this.isDeleteOffer) {
            this.deleteOfferModal.hide();
            message = 'Offer has been deleted.';
            this.isDeleteOffer = false;
            //--- DeleteMessageRecipents ----
            this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.staffId._id,
              this.offerDetails.jobPostId._id, 'delete');
            //-------------------------------

            // ----- delete Notification
            this.firebaseService.getAndDeleteNotification(
              this.offerDetails.practiceId._id , this.offerDetails.staffId._id,
              this.offerDetails._id            ,  this.notificationType.counterOffer
            );
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', false);
          } else {
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
            this.sendNotification('counter' );
          }
          // if ( this.showButtonCond.counterOffer) {
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
            // this.sendNotification('counter' );
          // }
          // else {
          //   this.sendNotification('final');
          // };
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

  // sendNotification() {

  //   const name = this.currentUser.firstName + ' ' + this.currentUser.lastName ;
  //   const jobTitle = this.offerDetails.jobPostId.jobTitle.toString();

  //   if (this.offerDetails.status === environment.OFFER_STATUS_NEW.CONTRACT) {
  //       // ----------------------- CONTRACT CREATED -----------------------------------
  //       this.notification.message = environment.notificationMessage.bidAccept.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.bidAccept + this.offerDetails.jobPostId._id;

  //   } else if (this.offerDetails.status === environment.OFFER_STATUS_NEW.DECLINE) {
  //       // ----------------------- DECLINE OFFER -----------------------------------
  //       const declinedMessage = this.declinedMessage.trim();
  //       this.notification.message = environment.notificationMessage.bidDecline.replace('#TITLE',
  //                                   jobTitle).replace('#NAME', name).replace('#MESSAGE', declinedMessage);
  //       this.notification.redirectLink = environment.notificationLink.declineOfferPractice;

  //     } else if (this.offerDetails.offerStatus === this.offerType.FINAL) {
  //       // ----------------------- FINAL OFFER -----------------------------------
  //       this.notification.message = environment.notificationMessage.finalOffer.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.practiceOffer + this.offerDetails._id;

  //   } else if (this.offerDetails.offerStatus === this.offerType.COUNTER) {
  //     // ----------------------- COUNTER OFFER -----------------------------------
  //     this.notification.message = environment.notificationMessage.finalOffer.replace('#TITLE', jobTitle).replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.practiceOffer + this.offerDetails._id;
  //   }

  //   this.notification.senderId = this.currentUser._id;
  //   this.notification.receiverId = this.offerDetails.staffId._id;
  //   // this.notification.createdAt = new Date();
  //   this.firebaseService.createNotification(this.notification);

  // }

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
    const id =  this.offerDetails._id;
    // const id = (checkType.indexOf(type) > -1) ? this.offerDetails._id : this.offerDetails.jobPostId._id;
    this.notification = {
            senderId    : this.currentUser._id,
            receiverId  : this.offerDetails.staffId._id,
            message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
            redirectLink : notification[type].staffLink + id,
            type : notification[type].type,
            offerId : id,
            jobId : jobId,
            staff: this.staffNotification,
            practice: {sentOffer: 0 , receivedOffer : 0, contract: 0},
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
    this.staffNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
  }

  removedChangeJobStatus (){
    this.setButtonCondition();
    this.toastr.success('Offer has been accepted.', 'Success');
  }

  // changeJobStatus() {
  //   const newJob = {
  //     _id : this.offerDetails.jobPostId._id,
  //     status: environment.JOB_STATUS.CONTRACT
  //   };
  //   this.jobsService.saveJob(newJob).subscribe(
  //     data => {
  //       if (data.status === 200) {
  //         this.setButtonCondition();
  //         this.toastr.success('Offer has been accepted.', 'Success');
  //       }
  //     },
  //     error => {
  //       this.spinner.hide();
  //       this.toastr.error(
  //         'There are some server Please check connection.',
  //         'Error'
  //       );
  //     }
  //   );
  // }

  numToArrConverter(i: number) {
    return new Array(i);
  }


  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  deleteOffer() {
    this.spinner.show();
    if (this.offerDetails.offerStatus   === this.offerType.INITIAL) {
      this.offerService.deleteOffer({_id: this.offerDetails}).subscribe( data => {
        if (data.status === 200) {
          this.spinner.hide();
          // ----- delete Notification
          this.firebaseService.getAndDeleteNotification(
                this.offerDetails.practiceId._id , this.offerDetails.staffId._id,
                this.offerDetails._id            ,  this.notificationType.initialOffer
          );
          if (this.offerDetails.sendOfferByPractice) {
            this.common.incDecJobCount(this.offerDetails.jobPostId, 'sentPracticeOffers', false);
          } else {
            this.common.incDecJobCount(this.offerDetails.jobPostId, 'sentStaffOffers', false);
          }
          this.location.back();
          this.toastr.success(
            'Offer has been deleted.',
            'Success'
          );
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
      });
    } else {
      this.isDeleteOffer = true;
      this.sendOffer = {
                          amount: 0 ,
                          message: '',
                          startTime: '',
                          endTime: ''
                      };
      this.sendOfferType();

    }

  }

  tempStr: any = '';
  onEditorChange(){
    this.tempStr = this.sendOffer.message;
    if ((this.tempStr===null) || (this.tempStr==='')){
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      return false;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      if(this.tempStr.length > 1000 ){
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning' );
        this.tempStr = this.tempStr.slice(0, 1000);
        this.sendOffer.message = this.tempStr;
        return false;
      }
    }
  }

  }
