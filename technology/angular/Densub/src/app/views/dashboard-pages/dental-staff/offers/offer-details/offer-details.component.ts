import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { JobsService } from '../../../dental-practice/jobs/job-posts/jobs.service';
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

    @ViewChild('offerJobModal1', { static: false })
    public offerJobModal1: ModalDirective;

    @ViewChild('declineJobModal', { static: false })
    public declineJobModal: ModalDirective;
    @ViewChild('deleteOfferModal', { static: false }) public deleteOfferModal: ModalDirective;
    @ViewChild('errorModal', { static: false }) public errorModal: ModalDirective;
    public destroyed = new Subject<any>();
    offerDetails: any = new Offer();
    jobTypes = environment.JOB_TYPE;
    userTypes = environment.USER_TYPE;
    jobTypeLabel = environment.JOB_LABEL;
    notificationType = environment.NOTIFICATION_TYPE;
    offerType = environment.OFFER_TYPE;
    offerStatus = environment.OFFER_STATUS_NEW;
    practiceNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
    paymentMethod = environment.PAYEMENT_METHOD;
    currentUser: currentUser = new currentUser;
    offerId = '';
    // editorConfig: any = {
    //   editable: true,
    //   spellcheck: true,
    //   height: '290px',
    //   // width: '200px',
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
      expiredMsg: false,
    };
    isDeleteOffer: Boolean = false;
    errorModalDetails = {
      title: '',
      message: '',
      notAvailable: false,
      isAlreadyBooked: false,
      isSendOfferPreviously: false,
      type: ''
    };

  constructor(
    private offerService: OfferService,
    private jobsService: JobsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtService: JwtService,
    private globalService: GlobalService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private router: Router,
    private common: Common,
    private location: Location,
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
          $or       : [
                        {status  : environment.OFFER_STATUS_NEW.OFFER},
                        {status  : environment.OFFER_STATUS_NEW.DECLINE},
                      ]
    };
    this.offerService.getOffer({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.offerDetails = data.data;
            this.checkAndUpdateNotification();
            this.setButtonCondition();
            console.log(this.offerDetails);
            this.sendOffer.amount = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount) ?
                                    this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount   :
                                    ((this.paymentMethod.HOURLY) ? this.offerDetails.jobPostId.desiredHourlyRate :
                                    this.offerDetails.jobPostId.desiredSalaryRate);

            this.sendOffer.startTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime) ?
                                    this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime   :
                                    this.offerDetails.jobPostId.startTime;

            this.sendOffer.endTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime) ?
                                    this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime   :
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
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  checkAndUpdateNotification() {
    const receiverId = this.offerDetails.staffId._id;
    const senderId  = this.offerDetails.practiceId._id;
    const offerId = this.offerDetails._id;
    const status =  environment.notificationStatus.UNREAD;
     this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
   }

  setButtonCondition() {
    console.log('Set button condition');
    this.showButtonCond = {
      acceptOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER
                      && (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)),

      declineOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
                      (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)),

      counterOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
                      (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)
                      && this.offerDetails.sendOfferByPractice
                      && (environment.OFFER_TYPE.INITIAL === this.offerDetails.offerStatus)
                      ),
      deleteOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
                        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF) &&
                        this.offerDetails.offerStatus === this.offerType.INITIAL),


      // finalOffer :   (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
      //                 (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)
      //                 && !this.offerDetails.sendOfferByPractice
      //                 && (environment.OFFER_TYPE.COUNTER === this.offerDetails.offerStatus)
      //                  ),

      waitingMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF)),


        declineMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.DECLINE),
        expiredMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.EXPIRED)
    };
    console.log(this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER);

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

     this.offerDetails['finalRate'] =    this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
            if (data.status === 200) {
              this.removedChangeJobStatus();
              //---Removed to contract status 30 May
              // this.changeJobStatus();
              setTimeout(() => {
                this.router.navigate(['staff/assignments/details', this.offerDetails._id]);
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

  removedChangeJobStatus (){
    this.practiceNotification['contract'] = 1;
    this.setButtonCondition();
    this.sendNotification('accept');
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
  //         this.practiceNotification['contract'] = 1;
  //         this.setButtonCondition();
  //         this.sendNotification('accept');
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

  declineOffer() {
    this.spinner.show();
    // ---- For Notification
    if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] ===  this.userTypes.PRACTICE) {
      this.practiceNotification['sentOffer'] = 1;
    } else {
      this.practiceNotification['receivedOffer'] = 1;
    }
    this.offerDetails.status = environment.OFFER_STATUS_NEW.DECLINE;
    this.offerDetails.offerDecline = {
        declineTime  : new Date(),
        reason       : this.declinedMessage,
        declineBy    : environment.USER_TYPE.STAFF
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
      this.offerDetails.offerSteps[isofferType].amount =  this.sendOffer.amount;
      this.offerDetails.offerSteps[isofferType].startTime =  this.sendOffer.startTime;
      this.offerDetails.offerSteps[isofferType].endTime =  this.sendOffer.endTime;

      if (this.isDeleteOffer) {
        this.offerDetails.offerStatus = this.offerType.INITIAL;
        this.offerDetails.offerSteps[isofferType].offerTime =  '';
        this.offerDetails.offerSteps[isofferType].offerBy =  '';
      } else {
        // ---- For Notification
        if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] ===  this.userTypes.PRACTICE) {
          this.practiceNotification['sentOffer'] = 1;
        } else {
          this.practiceNotification['receivedOffer'] = 1;
        }
        this.offerDetails.offerSteps[isofferType].offerTime =  new Date();
        this.offerDetails.offerSteps[isofferType].offerBy =  environment.USER_TYPE.STAFF;
        this.offerDetails.offerStatus = this.offerType.COUNTER;
      }


    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          if ( this.isDeleteOffer) {
            this.deleteOfferModal.hide();
            message = 'Offer has been deleted.';
            this.isDeleteOffer = false;
            //--- DeleteMessageRecipents ----
            this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.practiceId._id,
              this.offerDetails.jobPostId._id, 'delete');
            //-------------------------------
            // ----- delete Notification
            this.firebaseService.getAndDeleteNotification(
              this.offerDetails.staffId._id    ,  this.offerDetails.practiceId._id,
              this.offerDetails._id            ,  this.notificationType.counterOffer
            );
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', false);
          } else {
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
            this.sendNotification('counter' );
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

  closeModel() {
    this.offerJobModal.hide();
    this.declineJobModal.hide();
    this.offerJobModal1.hide();
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
  //       this.notification.message = environment.notificationMessage.bidDecline.replace('#TITLE', jobTitle).replace('#NAME', name).replace('#MESSAGE', declinedMessage);
  //       this.notification.redirectLink = environment.notificationLink.declineOfferStaff + this.offerDetails._id;

  //     } else if (this.offerDetails.offerStatus === environment.OFFER_TYPE.FINAL) {
  //       // ----------------------- FINAL OFFER -----------------------------------
  //       this.notification.message = environment.notificationMessage.counterOffer.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.staffOffer + this.offerDetails._id;

  //   } else if (this.offerDetails.offerStatus === environment.OFFER_TYPE.COUNTER) {
  //     // ----------------------- COUNTER OFFER -----------------------------------
  //     this.notification.message = environment.notificationMessage.counterOffer.replace('#TITLE', jobTitle).replace('#NAME', name);
  //       this.notification.redirectLink = environment.notificationLink.staffOffer + this.offerDetails._id;
  //   }
  //   this.notification.senderId = this.currentUser._id;
  //   this.notification.receiverId = this.offerDetails.practiceId._id;
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
    // console.log((checkType.indexOf(type) > -1));
    const id = this.offerDetails._id ;
    // const id = (checkType.indexOf(type) > -1) ? this.offerDetails._id : this.offerDetails.jobPostId._id;
    this.notification = {
            senderId    : this.currentUser._id,
            receiverId  : this.offerDetails.practiceId._id,
            message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
            redirectLink : notification[type].practiceLink + id,
            type : notification[type].type,
            offerId : id,
            jobId : jobId,
            staff: {sentOffer: 0 , receivedOffer : 0, contract: 0},
            practice: this.practiceNotification,
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
    this.practiceNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
  }

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
            this.offerDetails.staffId._id    ,  this.offerDetails.practiceId._id,
            this.offerDetails._id            ,  this.notificationType.initialOffer
          );
          this.common.incDecJobCount(this.offerDetails.jobPostId, 'sentStaffOffers', false);
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

  checkCalendar(type) {
    this.spinner.show();
    const jobDate = this.offerDetails.jobPostId.jobDate;
    const format = 'hh:mm';
    let offerStartTime, offerEndTime;
    if ( type === 'acceptOffer') {
      offerStartTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime;
      offerEndTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime;
    } else if (type ===  'counterOffer') {
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
    for ( let i = 0; i < this.offerDetails.staffId.availableDays.length; i++) {
      console.log(this.offerDetails);
      const calendarDate = this.offerDetails.staffId.availableDays[i];
      if (moment(calendarDate.start).isSame(moment(jobDate), 'date')) {
        if (calendarDate.available) {
          // -> Convert it  in minutes
          const calendarStartTime =  moment(moment(calendarDate.startTime, ['h:mm A']).format('HH:mm'), format);
          const calendarEndTime = moment(moment(calendarDate.endTime, ['h:mm A']).format('HH:mm'), format);
          const startTime = moment(moment(offerStartTime).format('HH:mm'), format);
          const endTime = moment(moment(offerEndTime).format('HH:mm'), format);
          // -----
          const condition = (
                              (
                                ( startTime.isSame(calendarStartTime) ||
                                  startTime.isBetween(calendarStartTime, calendarEndTime) ) &&
                                ( endTime.isSame(calendarEndTime) ||
                                  endTime.isBetween(calendarStartTime, calendarEndTime) )
                              ) ||
                              (calendarDate.startTime === '00:00' && calendarDate.endTime === '00:00')
                            );
          if (condition) {
              this.checkBooking(offerStartTime, offerEndTime, jobDate, type);
              break;
          } else {
            this.spinner.hide();
            if (type ===  'counterOffer') {
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
          if (type ===  'counterOffer') {
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
  }

  checkBooking(offerStartTime, offerEndTime, jobDate, type) {
    const condition = {
      staffId : this.currentUser._id,
      // _id: {$ne:''}
    };

    const matchDateTime = {
      startTime: offerStartTime,
      endTime: offerEndTime,
      jobDate: jobDate
    };
    this.offerService.checkBooking({condition, matchDateTime}).subscribe(
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
            if ( type === 'acceptOffer') {
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

  tempStr: any = '';
  onEditorChange(){
    this.tempStr = this.sendOffer.message;
    if ((this.tempStr===null) || (this.tempStr==='')){
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      return true;
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
