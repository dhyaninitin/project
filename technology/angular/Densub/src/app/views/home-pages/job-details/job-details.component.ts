import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { GlobalService } from '../../../shared-ui/service/global.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { currentUser } from './user.model';
import { JwtService } from '../../../shared-ui/service/jwt.service';
import { Router, ActivatedRoute } from '@angular/router';
import { JobsService } from '../../dashboard-pages/dental-practice/jobs/job-posts/jobs.service';
import { environment } from '../../../../environments/environment.prod';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FavoriteService } from '../../../shared-ui/service/favorite.service';
import { Favorite } from '../../../shared-ui/staff-list/favorite.model';
import { JobNewPost } from '../../../shared-ui/modal/job.modal';
import { FirebaseService } from '../../../shared-ui/service/firebase.service';
import { Notification } from '../../../shared-ui/modal/notification.modal';
import * as moment from 'moment';
import { Offer } from '../../../shared-ui/modal/offer.modal';
import { OfferService } from '../../../shared-ui/service/offer.service';
import { Common } from '../../../shared-ui/service/common.service';
import { WorkDiaryService } from '../../../shared-ui/service/workDiary.service';
import { UsersService } from '../../../shared-ui/service/users.service';
import { RatingService } from '../../../shared-ui/service/rating.service';
import { StripeService } from '../../../shared-ui/service/stripe.service';
//import {StripeCheckoutLoader, StripeCheckoutHandler} from '../../../shared-ui/service/stripe.service';
import { PaymentCardService } from '../../../shared-ui/service/paymentCard.service';
import { PaymentDetails } from '../../../shared-ui/modal/payment.modal';
import { PaymentService } from '../../../shared-ui/service/payment.service';
import { LicenseService } from '../../../shared-ui/service/license.service';
import { savedFilters } from '../../../shared-ui/global/allFilters';
import { Filter } from '../../../shared-ui/job-list/job-filter.model';
import { AddressService } from '../../../shared-ui/service/address.service';
import { Address } from '../../../shared-ui/modal/address.modal';
import { ActivityService } from '../../../shared-ui/service/activity.service';
import { PracticeService } from '../../dashboard-pages/admin/practice/practice.service';
import { PositionTypeService } from '../../../shared-ui/service/positionType.service';
import { animate, style, transition, trigger } from '@angular/animations';
declare var $: any;


@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
  animations: [
    trigger('myInsertRemoveTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('1000ms', style({ opacity: 0 }))
      ])
    ]),
  ]
})
export class JobDetailsComponent implements OnInit {
  @ViewChild('applyJobModal', { static: false }) public applyJobModal: ModalDirective;
  @ViewChild('errorModal', { static: false }) public errorModal: ModalDirective;

  @ViewChild('negotiateJobMdal', { static: false }) public negotiateJobMdal: ModalDirective;

  @ViewChild('declineJobModal', { static: false })
  public declineJobModal: ModalDirective;

  @ViewChild('offerJobModal1', { static: false })
  public offerJobModal1: ModalDirective;

  @ViewChild('offerJobModal', { static: false })
  public offerJobModal: ModalDirective;

  @ViewChild('deleteOfferModal', { static: false }) public deleteOfferModal: ModalDirective;

  backLink: Boolean = true;
  showApplyButton = false;
  jobStatus: any = environment.JOB_STATUS;
  totalJobPost: Number = 0 ;
  showJobDetails: Boolean = true;
  filterJobList: any = new Filter;
  searchText: any;
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
    height: 120,
    toolbarGroups: [
       { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
       { name: 'paragraph', groups: ['list'] },
    ],
    removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  };
  jobId = '';
  currentUser: currentUser = new currentUser;
  jobDetail: any = new JobNewPost();
  jobTypes = environment.JOB_TYPE;
  paymentMethod = environment.PAYEMENT_METHOD;
  offerStatus = environment.OFFER_STATUS_NEW;
  profileStatus = environment.PROFILE_STATUS;
  favorite: Favorite = new Favorite();
  notification: any = new Notification();
  isFavorite: Boolean = false;
  similarJobList: any = [];
  // isAmountDisabled = true;
  // offerAmount = 'hourlyRate';
  currentRoute: Boolean = false;
  staffCalendarInfo: any;
  offerTime = {
      type : 'defaultTime',
      isDisabled : true
  };
  offerAmount = {
    type: 'hourlyRate',
    isDisabled: true
  };
  offerDetails: any = new Offer();
  total = {
    jobPost: 0,
    staffHired: 0,
    hoursHired: 0,
    contractCancelled: 0,
    // totalOffers: 0,
    interviewsOpen: 0
  };
  errorModalDetails = {
    title: '',
    message: '',
    notAvailable: false,
    isAlreadyBooked: false,
    isSendOfferPreviously: false,
  };
  errorModalDetailsForAccept = {
    title: '',
    message: '',
    notAvailable: false,
    isAlreadyBooked: false,
    isSendOfferPreviously: false,
    type:''
  };
  tempAllRecipientValues: any = [];
  ratingCount: Number = 0;
  showButtonCond = {
    acceptOffer : false,
    declineOffer : false,
    counterOffer : false,
    // finalOffer : false,
    waitingMsg : false,
    declineMsg : false,
    deleteOffer: false,
    expiredMsg: false,
    appliedOffer:false,
  };
  offerType = environment.OFFER_TYPE;
  practiceNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
  userTypes = environment.USER_TYPE;
  declinedMessage = '';
  sendOffer = {
    amount: 0 ,
    message: '',
    startTime: '',
    endTime: ''
  };
  isDeleteOffer: Boolean = false;
  notificationType = environment.NOTIFICATION_TYPE;
  initialStartTime: any;
  initialStartTimeFlag: boolean;
  staffNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
  declineStaffList: any = [];
  contractDetail: any = new Offer();
  paymentDetails: any = new PaymentDetails();
  isExpiredLicense: boolean = false;
  offersList: any =  new Offer();
  address: any = new Address();
  activityData: number = 0;
  isSaved: boolean;
  activityDetails: any = [];
  totalSaved: number = 0;
  copiedText = '';
  url: any ;
  jobClosing : number = 0;
  postetdDaysAgo: number = 0;
  openSimilarSectionJobs = false;
  showLeftMenu = true;
  backRoute = '';
  staffpositionId: any = '';
  staffPositionType: any = '';
  showButton : boolean = true;

  constructor(
    private jwtService: JwtService,
    private globalService: GlobalService,
    private router: Router,
    private route: ActivatedRoute,
    private jobsService: JobsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private usersService: UsersService,
    private favoriteService: FavoriteService,
    private location: Location,
    private firebaseService: FirebaseService,
    private offerService: OfferService,
    private workDiaryService: WorkDiaryService,
    private common: Common,
    private ratingService: RatingService,
    private stripeService: StripeService,
    private PaymentCardService: PaymentCardService,
    private paymentService: PaymentService,
    private licenseService: LicenseService,
    private addressService: AddressService,
    private activityService: ActivityService,
    private positionTypeService: PositionTypeService
  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    if (window.location.href.includes('staff/job-details')) {
      this.backLink = false;
    }
    this.route.params.subscribe(res => {
      this.globalService.topscroll();
      this.jobId = res.jobId;
      this.getJobDetails(this.jobId);

    });
    this.currentRoute = this.router.url.includes('/job-details'); // GET THE ROUTE NAME SET CONDITIONS ON HTML
  }

  ngOnInit() {
    this.globalService.showBackButtonOnPracticePublicPage = '';
    this.showLeftMenu = this.jobsService.showLeftMenuForJobs;
    this.backRoute = this.jobsService.fetchRoute;
    if(this.currentUser == null){
      GlobalService.loginRedirectURL=this.router.url;
      this.spinner.hide();
      this.router.navigate(['/login'],{queryParams:{'redirectURL':this.route.url}});
    }else{
      GlobalService.loginRedirectURL=null;
      this.getAllMessageRecipients(); // !!! GET THE MESSAGE RECIPIENTS FROM FIREBASE DB !!!
      this.getCurrentUserInfo();
      this.setButtonCondition();
      this.getOfferDetails();
      this.getAllOffers();
    }
    this.licenseService.isValidLicense().then(res=>{
        this.isExpiredLicense = res;
    }, err=>{
      this.isExpiredLicense = false;

    })
    $(()=>{
      $('[data-toggle="tooltip"]').tooltip();
    })

    if(this.offerService.fromInvitation){
      this.openSimilarSectionJobs = true;
    }else{
      this.openSimilarSectionJobs = false;
    }
  }

  checkAndUpdateNotification() {
    const receiverId = this.offerDetails.staffId._id;
    const senderId  = this.offerDetails.practiceId._id;
    const offerId = this.offerDetails._id;
    const status =  environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
   }



  goBack() {
    this.location.back();
  }

  getJobDetails(jobId) {
    this.spinner.show();
    const condition = {
     _id : jobId
    };
    this.jobsService.getJobsWithDetails({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.jobDetail = data.data[0];
            this.getRatingsCount();
            this.closingJobDaysAgo();
            this.postedJobDaysAgo();
            // For permanent job salary based
            if (this.jobDetail.paymentMethod && this.jobDetail.paymentMethod === this.paymentMethod.SALARY){
              this.offerAmount.type = 'salaryRate';
            }
            this.getAddress();
            this.checkSendoffer();
            this.getFavoriteList();
           // this.getSimilarStaffProfiles();
            this.getTotalCounts();
            this.showApplyButtonsOnPosition();
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

  getTotalCounts() {
    this.totalCancelContract();
    this.getTotalStaffHired();
    // this.getTotalSentOffers();
    this.getTotalInterviewsOpen();
    this.getTotalHoursHired();
    this.getTotalJobPost();
  }

  getFavoriteList() {
    const condition = {
      userId : this.currentUser._id,
      type : environment.FAVORITE_TYPE.JOB,
      favoriteId : this.jobDetail._id
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

  getCurrentUserInfo() {
    const condition = {
                        _id : this.currentUser._id
                      };
    this.usersService.getUserInfo(condition).subscribe( data => {
      if (data.status === 200) {
        if (data.data) {
          this.staffCalendarInfo = data.data.availableDays;
          this.staffpositionId = data.data.positionType;
          this.getPositionType(this.staffpositionId);
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
      } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
      }
    });
  }

  showApplyJobMdal() {
    if (this.currentUser) {
      this.offerAmount.type = 'hourlyRate';
      this.offerTime.type = 'defaultTime';
      this.offerDetails.offerSteps.initial.message = '<p class="text-muted"><i>Hi,</i></p><p><i>I am interested to apply for this job and available to work at the requested date and time.</i></p><p><i>'+this.currentUser.firstName + ' ' +this.currentUser.lastName.charAt(0)+'</i></p>'
      this.showOfferTime();
      this.showOfferAmount();
      this.applyJobModal.show();
      this.offerAmount.isDisabled = true;
    } else {
      this.router.navigate(['/login']);
    }
  }

  showNegotiateJobMdal() {
    if (this.currentUser) {
      this.offerAmount.type = 'newRate';
      this.offerTime.type = 'changeTime';
      this.offerDetails.offerSteps.counter.message = '<p><i>Hi,</i></p><p><i>I am interested to apply for this job and available based on the above negotiated terms.</i></p><p><i>'+this.currentUser.firstName + ' ' +this.currentUser.lastName.charAt(0)+'</i></p>'
      this.showOfferTime();
      this.showOfferAmount();
      this.negotiateJobMdal.show();
      this.offerAmount.isDisabled = false;

      if(this.jobDetail.paymentMethod === this.paymentMethod.HOURLY){
        this.offerDetails.offerSteps.counter.amount = (this.jobDetail.desiredHourlyRate) ? (this.jobDetail.desiredHourlyRate) : 0;
      }else if(this.jobDetail.paymentMethod === this.paymentMethod.SALARY){
        this.offerDetails.offerSteps.counter.amount = (this.jobDetail.desiredSalaryRate) ? this.jobDetail.desiredSalaryRate : 0;
      }
      this.offerDetails.offerSteps.counter.startTime = new Date(this.jobDetail.startTime);
      this.offerDetails.offerSteps.counter.endTime = new Date(this.jobDetail.endTime);

    } else {
      this.router.navigate(['/login']);
    }
  }

  closeModel() {
    this.applyJobModal.hide();
    this.offerJobModal1.hide();
    this.declineJobModal.hide();
    this.offerJobModal.hide();
    this.negotiateJobMdal.hide();
  }


  checkCalendar(type: any) {
    this.spinner.show();
    const jobDate = this.jobDetail.jobDate;
    const offerStartTime = this.offerDetails.offerSteps.initial.startTime;
      const offerEndTime = this.offerDetails.offerSteps.initial.endTime;
    if(type === this.offerType.INITIAL){
      const offerStartTime = this.offerDetails.offerSteps.initial.startTime;
      const offerEndTime = this.offerDetails.offerSteps.initial.endTime;
    }else if(type === this.offerType.COUNTER){
      const offerStartTime = this.offerDetails.offerSteps.counter.startTime;
      const offerEndTime = this.offerDetails.offerSteps.counter.endTime;
    }

    const format = 'hh:mm';
    this.errorModalDetails = {
      title: '',
      message: '',
      notAvailable: false,
      isAlreadyBooked: false,
      isSendOfferPreviously: false,
    };
    this.checkBooking(offerStartTime, offerEndTime, jobDate, type);

    // for ( let i = 0; i < this.staffCalendarInfo.length; i++) {
    //   const calendarDate = this.staffCalendarInfo[i];
    //   if (moment(calendarDate.start).isSame(moment(jobDate), 'date')) {
    //     if (calendarDate.available) {
    //       // -> Convert it  in minutes
    //       const calendarStartTime =  moment(moment(calendarDate.startTime, ['h:mm A']).format('HH:mm'), format);
    //       const calendarEndTime = moment(moment(calendarDate.endTime, ['h:mm A']).format('HH:mm'), format);
    //       const startTime = moment(moment(offerStartTime).format('HH:mm'), format);
    //       const endTime = moment(moment(offerEndTime).format('HH:mm'), format);
    //       // -----
    //       const condition = (
    //                           (
    //                             ( startTime.isSame(calendarStartTime) ||
    //                               startTime.isBetween(calendarStartTime, calendarEndTime) ) &&
    //                             ( endTime.isSame(calendarEndTime) ||
    //                               endTime.isBetween(calendarStartTime, calendarEndTime) )
    //                           ) ||
    //                           (calendarDate.startTime === '00:00' && calendarDate.endTime === '00:00')
    //                         );
    //       if (condition) {
    //           this.checkBooking(offerStartTime, offerEndTime, jobDate);
    //           break;
    //       } else {
    //         this.spinner.hide();
    //         this.applyJobModal.hide();
    //         this.errorModalDetails = {
    //           title: 'Update Calendar',
    //           message: 'Update your availability to apply for this job',
    //           notAvailable: true,
    //           isAlreadyBooked: false,
    //           isSendOfferPreviously: false,
    //         };
    //         this.errorModal.show();
    //       }
    //     } else {
    //       this.spinner.hide();
    //       this.applyJobModal.hide();
    //       this.errorModalDetails = {
    //         title: 'Update Calendar',
    //         message: 'Update your availability to apply for this job',
    //         notAvailable: true,
    //         isAlreadyBooked: false,
    //         isSendOfferPreviously: false,
    //       };
    //       this.errorModal.show();
    //       break;
    //     }
    //   }
    // }
  }

  checkBooking(offerStartTime: any, offerEndTime: any, jobDate: any, type: any) {

    const condition = {
      staffId : this.currentUser._id,
      // _id: {$ne:''}
    };

    const matchDateTime = {
      startTime: offerStartTime,
      endTime: offerEndTime,
      jobDate: jobDate
    };
    
    this.applyOffer(type);
    // this.offerService.checkBooking({condition, matchDateTime}).subscribe(
    //   data => {
    //     if (data.status = 200) {
    //       if (data.data.isAlreadyBooked) {
    //         this.spinner.hide();
    //         this.applyJobModal.hide();
    //         this.errorModalDetails = {
    //           title: 'Already Booked',
    //           message: 'You are already booked at this time',
    //           notAvailable: false,
    //           isAlreadyBooked: true,
    //           isSendOfferPreviously: false,
    //         };
    //         this.errorModal.show();
    //       } else if (data.data.isAlreadyBooked) {
    //         this.spinner.hide();
    //         this.applyJobModal.hide();
    //         this.errorModalDetails = {
    //           title: 'Already Send Offer',
    //           message: 'You have already send offer at this time',
    //           notAvailable: false,
    //           isAlreadyBooked: false,
    //           isSendOfferPreviously: true,
    //         };
    //         this.errorModal.show();
    //       } else {
    //         this.applyOffer(type);
    //       }
    //     } else {
    //       this.spinner.hide();
    //       this.toastr.error(
    //         'There are some server Please check connection.',
    //         'Error'
    //       );
    //     }
    //   }, error => {
    //     this.spinner.hide();
    //     this.toastr.error(
    //       'There are some server Please check connection.',
    //       'Error'
    //     );
    //   }
    // );
  }

  applyOffer(type: string) {
    // console.log("I am in apply job");
    // return false;

    this.spinner.show();
    console.log(this.jobDetail);
    this.applyJobModal.hide();
    this.negotiateJobMdal.hide();
    this.showApplyButton = true;
    this.globalService.setLoadingLabel('Sending Offer ... Please Wait.');
    if(type === this.offerType.INITIAL){
      this.offerDetails.offerSteps.initial.offerTime = new Date();
      this.offerDetails.offerSteps.initial.offerBy = environment.USER_TYPE.STAFF;
    }else if(type === this.offerType.COUNTER){
      this.offerDetails.offerSteps.initial.offerTime = this.jobDetail.createdAt;
    this.offerDetails.offerSteps.initial.offerBy = environment.USER_TYPE.PRACTICE;
    this.offerDetails.offerSteps.initial.amount = this.jobDetail.desiredHourlyRate;
    this.offerDetails.offerSteps.initial.startTime = new Date(this.jobDetail.startTime);
    this.offerDetails.offerSteps.initial.endTime = new Date(this.jobDetail.endTime);

    this.offerDetails.offerSteps.counter.offerTime = new Date();
    this.offerDetails.offerSteps.counter.offerBy = environment.USER_TYPE.STAFF;
    this.offerDetails.offerStatus = this.offerType.COUNTER;
    }

    this.offerDetails.practiceId = this.jobDetail.createdBy._id;
    this.offerDetails.practiceName = this.jobDetail.practiceName._id;
    this.offerDetails.jobPostId = this.jobDetail._id;
    this.offerDetails.staffId = this.currentUser._id;
    this.offerDetails.contractStartTime = new Date();
    this.offerDetails.isApplyied = true;
    this.offerDetails.practiceName = this.jobDetail.practiceName._id;

    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status = 200) {
          this.offerDetails = data.data;
          this.common.incDecJobCount(this.jobDetail, 'sentStaffOffers', true);

          this.sendNotification('initial', data.data._id);
          this.getOfferDetails();

          // -------------------------------------------
          this.spinner.hide();
          this.toastr.success(
            'You have successfully applied.',
            'Success'
          );

           // ------------------- Create Connection For Message App-----------
           this.checkPreviousRecipents();
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

  getAllMessageRecipients(){
    const self = this;
    self.spinner.show();
    let s = self.firebaseService.GetMessageRecipients('UserMessageRecipient',
      'recipients/' + self.currentUser._id + '/id', self.currentUser._id);
    s.once('value', async function(snapshot) {
      if (snapshot.val()){
        const values = Object.values(snapshot.val());
        self.tempAllRecipientValues = values;
        return;
      }
    });
    self.spinner.hide();
  };

  checkPreviousRecipents() {
    const self = this;
    if (self.tempAllRecipientValues && self.tempAllRecipientValues.length){
      self.tempAllRecipientValues.forEach((item: { [x: string]: { [x: string]: any; }; }, index: number) => {
        let iscreateRecipient = false;
        const keys = Object.keys(item['recipients']);
        let partnerId = keys.indexOf(this.jobDetail.createdBy._id);
        if (
          item['group']['group_id'] !== this.jobDetail._id ||
          (item['group']['group_id'] === this.jobDetail._id && partnerId === -1)
        ){
          iscreateRecipient = true;
        }
        if ((self.tempAllRecipientValues.length - 1) === index && iscreateRecipient) {
          //self.createRecipents();
        }
      });
    }else{
      //self.createRecipents();
    }
  }

  createRecipents() {
    console.log("I am in createRecipents");
    const userMessageRecipient = this.firebaseService.createUserMessageRecipientModal(this.jobDetail._id, this.jobDetail.jobTitle, this.currentUser, this.jobDetail.createdBy);
    const userMessage = this.firebaseService.createUserMessageModal(this.currentUser, this.jobDetail.createdBy);
    const postData = {
      userMessageRecipient: userMessageRecipient,
      userMessage: userMessage
    };
    this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
  }

  sendNotification(type = '', offerId: number) {
    if (!type) {
      return false;
    }
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.jobDetail.jobTitle.toString());
    const message = '';
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = this.jobDetail._id;
    this.notification = {
            senderId    : this.currentUser._id,
            receiverId  : this.jobDetail.createdBy._id,
            message     : notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
            redirectLink : notification[type].practiceLink + id,
            type : notification[type].type,
            offerId : offerId,
            jobId : id,
            staff: {sentOffer: 0 , receivedOffer : 0, contract: 0},
            practice: {sentOffer: 0 , receivedOffer : 1, contract: 0},
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD,
             
    };
    console.log(this.notification)
    this.firebaseService.createNotification(this.notification);
  }

/*   sendNotification() {
    const name = this.currentUser.firstName + ' ' + this.currentUser.lastName ;
    const jobTitle = this.jobDetail.jobTitle.toString();
    this.notification.message = environment.notificationMessage.bidReceived.replace('#TITLE', jobTitle).replace('#NAME', name);
    this.notification.redirectLink = environment.notificationLink.bidReceived + this.jobDetail._id;
    this.notification.senderId = this.currentUser._id;
    this.notification.receiverId = this.jobDetail.createdBy;
    this.firebaseService.createNotification(this.notification);
  } */

  checkSendoffer() {
    const condition = {
      jobPostId: this.jobDetail._id,
      practiceId: this.jobDetail.createdBy._id,
      staffId: this.currentUser._id
    };
    this.offerService.getOffer({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.offerDetails = data.data;
            console.log(this.offerDetails);
            this.showApplyButton = true;
          } else {
            this.showApplyButton = false;
          }
          this.showJobDetails = false;
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

  getSimilarStaffProfiles() {
    // const self = this;
    // this.spinner.show();
    const condition = {
     positionType : this.jobDetail.positionType,
      _id : {$ne : this.jobId }
    };
    this.jobsService.getJobs({ condition: condition , limit : 10}).subscribe(
        data => {
          if (data.status === 200) {
            this.similarJobList = data.data;
            if(this.openSimilarSectionJobs){
              this.offersList = this.similarJobList;
            }
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



  getTotalJobPost() {
    const condition = {
      createdBy : this.jobDetail.createdBy._id
    };
    this.jobsService.getJobCount({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.total.jobPost = data.data;
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

  showOfferAmount() {
      if(this.jobDetail.paymentMethod === this.paymentMethod.SALARY){
        this.offerAmount.type = 'salaryRate';
      }else{
        this.offerAmount.type = 'hourlyRate';
      }
      if (this.offerAmount.type === 'hourlyRate') {
        this.offerAmount.isDisabled = true;
        this.offerDetails.offerSteps.initial.amount = (this.jobDetail.desiredHourlyRate) ? this.jobDetail.desiredHourlyRate : 0;
      } else if (this.offerAmount.type === 'salaryRate') {
        this.offerAmount.isDisabled = true;
        this.offerDetails.offerSteps.initial.amount = (this.jobDetail.desiredSalaryRate) ? this.jobDetail.desiredSalaryRate : 0;
      } else {
        // For new rate
        this.offerDetails.offerSteps.initial.amount = '';
        // this.offerDetails.offerSteps.initial.amount = 0;
        this.offerAmount.isDisabled = false;
      }
  }


  getTotalHoursHired() {
    const condition = {
      practiceId : this.jobDetail.createdBy._id
    };
    this.workDiaryService.getTotalHours({condition}).subscribe(
      data => {
        if (data.status === 200) {
          this.total.hoursHired = Math.round(data.data);
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

  showOfferTime() {
      if (this.offerTime.type === 'defaultTime') {
        this.offerTime.isDisabled = true;
        this.offerDetails.offerSteps.initial.startTime = new Date(this.jobDetail.startTime);
        this.offerDetails.offerSteps.initial.endTime = new Date(this.jobDetail.endTime);
      } else if (this.offerTime.type === 'changeTime') {
        this.offerTime.isDisabled = false;
        this.offerDetails.offerSteps.initial.startTime = '';
        this.offerDetails.offerSteps.initial.endTime = '';
      }
  }

  timeValidation(type: string) {
     const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
     const startTime = this.offerDetails.offerSteps.counter.startTime;
     const endTime = this.offerDetails.offerSteps.counter.endTime;
     if (endTime && startTime && (endTime !== startTime)) {
      if (startTime > endTime) {
         if (type === 'startTime') {
           this.offerDetails.offerSteps.counter[otherType] = this.offerDetails.offerSteps.counter[type];
         } else {
           setTimeout(() => {
           this.offerDetails.offerSteps.counter[type] = this.offerDetails.offerSteps.counter[otherType];
           }, 200);
         }
       }
        if(this.initialStartTime === startTime){
          this.initialStartTimeFlag = true;
        }else{
          this.initialStartTimeFlag = false;
        }
     } else {
       this.offerDetails.offerSteps.counter[otherType] = this.offerDetails.offerSteps.counter[type];
     }
 }


totalCancelContract() {
  var condition = {
    contractStatus: environment.CONTRACT_STATUS.CANCELLED,
    practiceId: this.jobDetail.createdBy._id
  };
  this.offerService.getTotal({condition}).subscribe( data => {
      if (data.status === 200) {
        this.total.contractCancelled = data.data;
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

getTotalStaffHired() {
  // environment.OFFER_STATUS_NEW.DELETED
  // environment.OFFER_STATUS_NEW.CONTRACT
  const condition = {
    practiceId: this.jobDetail.createdBy._id,
    status: environment.OFFER_STATUS_NEW.CONTRACT,
    $or:[
      {contractStatus: environment.CONTRACT_STATUS.COMPLETED},
      {contractStatus: environment.CONTRACT_STATUS.UPCOMING},
      {contractStatus: environment.CONTRACT_STATUS.MARKASPAIDSTAFF}
    ],
  };
    this.offerService.getTotal({condition}).subscribe(data => {
      if (data.status === 200) {
        if (data.data > 0) {
          this.total.staffHired = data.data;
          // this.totalJobsWorked = data.data;
        }
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
    });
}

// getTotalSentOffers() {
//   const condition = {
//     status: environment.OFFER_STATUS_NEW.OFFER,
//   };
//     this.offerService.getTotal({condition}).subscribe(data => {
//       if (data.status === 200) {
//         if (data.data > 0) {
//           this.total.totalOffers = data.data;
//         }
//       } else {
//         this.toastr.error(
//           'There are some server Please check connection.',
//           'Error'
//         );
//       }
//     }, error => {
//         this.toastr.error(
//           'There are some server Please check connection.',
//           'Error'
//         );
//     });
// }

getTotalInterviewsOpen() {
  const condition = {
    jobPostId : this.jobDetail._id,
    status: environment.OFFER_STATUS_NEW.OFFER,
    offerStatus: environment.OFFER_TYPE.COUNTER
  };
    this.offerService.getTotal({condition}).subscribe(data => {
      if (data.status === 200) {
        if (data.data > 0) {
          this.total.interviewsOpen = data.data;
        }
      } else {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    }, error => {
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
    });
}
numToArrConverter(i: number) {
  return new Array(i);
}

getRatingsCount() {
  var condition = {
    practiceId : {$eq : this.jobDetail.createdBy._id},
    ratedBy : {$eq : environment.USER_TYPE.STAFF},
    status  : environment.RATING_STATUS.DONE
  };

  this.ratingService.getRatingsCount({condition: condition}).subscribe(async data => {
    if (data.status === 200) {
        if (data.data) {
          this.ratingCount = data.data;
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
    });
}

setButtonCondition() {
  console.log(this.offerDetails);
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

    appliedOffer : (this.offerDetails.status === environment.OFFER_STATUS_NEW.APPLYED &&
        (this.offerDetails.offerSteps[this.offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE)),


      declineMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.DECLINE),
      expiredMsg : (this.offerDetails.status === environment.OFFER_STATUS_NEW.EXPIRED)
  };
  console.log(this.offerDetails.status === environment.OFFER_STATUS_NEW.OFFER);

}


// getOfferDetails() {
//   this.spinner.show();
//   const condition = {
//         _id       : this.offerId,
//         $or       : [
//                       {status  : environment.OFFER_STATUS_NEW.OFFER},
//                       {status  : environment.OFFER_STATUS_NEW.DECLINE},
//                     ]
//   };
//   this.offerService.getOffer({ condition: condition }).subscribe(
//     data => {
//       if (data.status === 200) {
//         if (data.data) {
//           this.offerDetails = data.data;

//           this.setButtonCondition();
//           console.log(this.offerDetails);

//           this.sendOffer.amount = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount) ?
//           this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount   :
//           ((this.paymentMethod.HOURLY) ? this.offerDetails.jobPostId.desiredHourlyRate :
//           this.offerDetails.jobPostId.desiredSalaryRate);

//           this.sendOffer.startTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime) ?
//                     this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime   :
//                     this.offerDetails.jobPostId.startTime;

//           this.sendOffer.endTime = (this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime) ?
//                     this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime   :
//                     this.offerDetails.jobPostId.endTime;

//         } else {
//           this.router.navigate(['staff/dashboard']);
//         }
//       } else {
//         this.toastr.error(
//           'There are some server Please check connection.',
//           'Error'
//         );
//       }
//       this.spinner.hide();
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


removedChangeJobStatus (){
  this.practiceNotification['contract'] = 0;
  this.setButtonCondition();
  this.sendNotification('accept',0);
  this.toastr.success('Application has been sent successfully.', 'Success');
}
acceptOffer() {
  this.spinner.show();
  this.offerDetails.status = environment.OFFER_STATUS_NEW.APPLYED;
  this.offerDetails.contractStartTime = new Date();
  this.offerDetails.isApplyied = true;
  //this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
  // To check is the offer is send by practice so to change the amount
  // const ischeckIniOfferPractice = ((this.offerDetails.offerStatus == this.offerType.INITIAL) && this.offerDetails.sendOfferByPractice);



  // this.offerDetails['finalRate'] =  (this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount) ?
  //                                 this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount   :
  //                                  ((this.paymentMethod.HOURLY === this.offerDetails.jobPostId.paymentMethod) ?
  //                                  this.offerDetails.jobPostId.desiredHourlyRate :
  //                                  this.offerDetails.jobPostId.desiredSalaryRate);

  //  this.offerDetails['finalRate'] =    this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount;
   this.offerDetails.offerSteps[this.offerDetails.offerStatus].message = this.sendOffer.message;
  this.offerService.addOffer(this.offerDetails).subscribe(
    data => {
          if (data.status === 200) {
            this.closeModel();
            this.removedChangeJobStatus();
            //---Removed to contract status 30 May
            // this.changeJobStatus();
            if(data.data.offerStatus !== 'recounter'){
              this.common.incDecJobCount(this.jobDetail, 'sentStaffOffers', true);
            }
            //Commented as per new flow
            // setTimeout(() => {
            //   this.router.navigate(['staff/assignments/details', this.offerDetails._id]);
            // }, 1000 );
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
    this.tempStr = this.offerDetails.offerSteps.initial.message;
    if ((this.tempStr === null) || (this.tempStr === '')) {
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      return true;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace( /(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace( '&nbsp;', '');
      if (this.tempStr.length > 1000 ) {
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning' );
        this.tempStr = this.tempStr.slice(0, 1000);
        this.offerDetails.offerSteps.initial.message = this.tempStr;
        return false;
      }
    }
  }


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
          if(this.offerDetails.offerStatus == 'recounter'){
            this.sendNotification('finalOfferDecline',this.offerDetails.jobPostId._id);
          }else{
            this.sendNotification('decline',this.offerDetails._id);
          }
         
          this.closeModel();
          if(this.offerDetails.offerStatus == 'recounter'){
            this.toastr.success(
              'Final offer has been declined.',
              'Success'
            );
          } else{
            this.toastr.success(
              'Invitation is declined.',
              'Success'
            );

          }
          this.router.navigate(['/job-listing']);
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


  getOfferDetails() {
    this.spinner.show();
    const condition = {
        jobPostId   : this.jobId,
          $or       : [
                        {status  : environment.OFFER_STATUS_NEW.OFFER},
                        {status  : environment.OFFER_STATUS_NEW.DECLINE},
                        {status  : environment.OFFER_STATUS_NEW.APPLYED},
                      ],
        $and        :[
                      {staffId : this.currentUser._id}
                      ]
    };
    console.log(condition);
    this.offerService.getOffer({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.offerDetails = data.data;
            this.initialStartTime = this.offerDetails.offerSteps.initial.startTime;
            this.checkAndUpdateNotification();
            this.setButtonCondition();

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
            // this.router.navigate(['staff/dashboard']);
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


  //accept offer flow

  checkCalendarForAccpet(type: string) {    
      const condition = {
        jobPostId   : this.jobId,
          $or       : [
                        {status  : environment.OFFER_STATUS_NEW.OFFER},
                        {status  : environment.OFFER_STATUS_NEW.DECLINE},
                      ],
        $and        :[
                      {staffId : this.currentUser._id}
                      ]
    };

    this.offerService.getOffer({ condition: condition }).subscribe(
        data => {
          if (data.status === 200) {
            if (data.data) {
              this.spinner.show();
              const jobDate = this.offerDetails.jobPostId.jobDate;
              const format = 'hh:mm';
              let offerStartTime: string, offerEndTime: string;
              if ( type === 'acceptOffer') {
                offerStartTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime;
                offerEndTime = this.offerDetails.offerSteps[this.offerDetails.offerStatus].endTime;
              } else if (type ===  'counterOffer') {
                offerStartTime = this.sendOffer.startTime;
                offerEndTime = this.sendOffer.endTime;
              }
              this.errorModalDetailsForAccept = {
                title: '',
                message: '',
                notAvailable: false,
                isAlreadyBooked: false,
                isSendOfferPreviously: false,
                type: type
              };

              this.checkBookingForAccept(offerStartTime, offerEndTime, jobDate, type);


              // for ( let i = 0; i < this.offerDetails.staffId.availableDays.length; i++) {
              //   const calendarDate = this.offerDetails.staffId.availableDays[i];
              //   if (moment(calendarDate.start).isSame(moment(jobDate), 'date')) {
              //     if (calendarDate.available) {
              //       // -> Convert it  in minutes
              //       const calendarStartTime =  moment(moment(calendarDate.startTime, ['h:mm A']).format('HH:mm'), format);
              //       const calendarEndTime = moment(moment(calendarDate.endTime, ['h:mm A']).format('HH:mm'), format);
              //       const startTime = moment(moment(offerStartTime).format('HH:mm'), format);
              //       const endTime = moment(moment(offerEndTime).format('HH:mm'), format);
              //       // -----
              //       const condition = (
              //                           (
              //                             ( startTime.isSame(calendarStartTime) ||
              //                               startTime.isBetween(calendarStartTime, calendarEndTime) ) &&
              //                             ( endTime.isSame(calendarEndTime) ||
              //                               endTime.isBetween(calendarStartTime, calendarEndTime) )
              //                           ) ||
              //                           (calendarDate.startTime === '00:00' && calendarDate.endTime === '00:00')
              //                         );
              //       if (condition) {
              //           this.checkBookingForAccept(offerStartTime, offerEndTime, jobDate, type);
              //           break;
              //       } else {
              //         this.spinner.hide();
              //         if (type ===  'counterOffer') {
              //           this.offerJobModal.hide();
              //         }
              //         this.errorModalDetailsForAccept = {
              //           title: 'Update Calendar',
              //           message: 'Update your availability to apply for this job',
              //           notAvailable: true,
              //           isAlreadyBooked: false,
              //           isSendOfferPreviously: false,
              //           type: type
              //         };
              //         this.errorModal.show();
              //       }
              //     } else {
              //       this.spinner.hide();
              //       if (type ===  'counterOffer') {
              //         this.offerJobModal.hide();
              //       }
              //       this.errorModalDetailsForAccept = {
              //         title: 'Update Calendar',
              //         message: 'Update your availability to apply for this job',
              //         notAvailable: true,
              //         isAlreadyBooked: false,
              //         isSendOfferPreviously: false,
              //         type: type
              //       };
              //       this.errorModal.show();
              //       break;
              //     }
              //   }
              // }
            } else {
              console.log('get offer else');
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


  checkBookingForAccept(offerStartTime: any, offerEndTime: any, jobDate: any, type: string) {
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
            this.errorModalDetailsForAccept = {
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
            this.errorModalDetailsForAccept = {
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
              this.acceptOffer();
            } else if (type === 'counterOffer') {
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
      this.offerDetails.contractStartTime = new Date();
      this.offerDetails.isApplyied = true;

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
            this.sendNotificationForAccept('counter' );
          }
          // if(this.showButtonCond.counterOffer) {
           // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
           // this.sendNotification('counter');
          // }
          // else {
          //   this.sendNotification('final');
          // }
          this.setButtonCondition();
          this.common.incDecJobCount(this.jobDetail, 'sentStaffOffers', true);
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

  sendNotificationForAccept(type = '') {
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
    let id = this.offerDetails._id;
    if(type=='counter'){
      id = this.offerDetails.jobPostId._id; 
    }
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
            practice: {sentOffer: 0 , receivedOffer : 1, contract: 0}, //this.practiceNotification,
            createdAt: currentTime,
            updatedAt: currentTime,
            status : environment.notificationStatus.UNREAD,
            isViewedByPractice : false
    };
    this.firebaseService.createNotification(this.notification);
    this.practiceNotification = {sentOffer: 0 , receivedOffer : 0, contract: 0 };
  }



  acceptReCounterOffer(offerDetails) {
     //Get card from DB
     this.globalService.setLoadingLabel('Please be patient while we process this transaction as it may take a little longer than usual. Do not refresh or hit the back button.');
     this.spinner.show();
     let stripeCustomerId:any;
    const email = this.offerDetails.practiceId.email;
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            //if card info found
              const postObject = {
                cardId: data.data[0].cardId,
                customerId: data.data[0].customerId,
              };
              let postObjectNew = {};

              this.stripeService.retrieveCard(postObject).subscribe(
                async data => {
                  if (data['status'] === 200) {
                    //createCharge(); 
                    const currntYear  = new Date().getFullYear();
                    const currntMounth =  new Date().getMonth() + 1;
                    stripeCustomerId = data.data.customer;
                  
                    //   async data => {
                        postObjectNew = {
                          customer:stripeCustomerId,
                        };                         
                        // For workDiary payment
                        const workdiaryAmount = offerDetails.amount;
                        let amount = this.globalService.stripeTotalAmt(workdiaryAmount);
                       
                          // if (this.offerDetails.staffId.stripeId) {
                          //   postObjectNew['destination'] = this.offerDetails.staffId.stripeId;  //
                          //   postObjectNew['destination'] = "acct_1GI5ArHhmkThwYko";
                          // } else {
                          //   this.toastr.success('Please Check Connection.', 'Success');
                          //   return 0;
                          // }
                          postObjectNew['amount'] = amount;

                          this.stripeService.createAutoCharge(postObjectNew).subscribe(
                            async data => {
                              if (data['status'] === 200) {
                                this.paymentDetails.payerUserId = this.offerDetails.practiceId._id;
                                this.paymentDetails.transactionId = data['data']['balance_transaction'];
                                this.paymentDetails.amount = (data['data']['amount']) / 100;
                                this.paymentDetails.mode = data['data']['source.type '];
                                this.paymentDetails.status = data['data']['status'];
                                this.paymentDetails.destination = data['data']['transfer_data']['destination'];
                                this.paymentDetails.receiptURL = data['data']['receipt_url'];
                                this.paymentDetails.jobPostId = this.offerDetails.jobPostId._id;
                                
                                this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.CONTRACT;
                                await this.addPaymentDetails();
                                
                               //this.router.navigate(['job-details',this.offerDetails.jobPostId._id]);

                              }else if(data['status'] === 500){
                                this.toastr.warning('Sorry, We apologize for any inconvenience, Densub was not able to process this transaction due to practice’s account status. We have notified the practice of the issue. Once the practice has corrected the issue, this position may be reposted.','warning');
                                const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
                                const title = this.globalService.titleCase(this.jobDetail.jobTitle.toString());
                                const message = '';
                                const type = 'decline';
                                const currentTime = new Date().getTime();
                                const notification = environment.notification;
                                const id = this.jobDetail._id;
                                this.notification = {
                                        senderId    : this.currentUser._id,
                                        receiverId  : this.jobDetail.createdBy._id,
                                        message     : 'The applicant was not able to accept your counter offer because your credit card was not able to be processed. Please check and update your credit card information',
                                        redirectLink : notification[type].practiceLink + id,
                                        type : notification[type].type,
                                        offerId : this.offerDetails._id,
                                        jobId : id,
                                        staff: {sentOffer: 0 , receivedOffer : 0, contract: 0},
                                        practice: {sentOffer: 0 , receivedOffer : 1, contract: 0},
                                        createdAt: currentTime,
                                        updatedAt: currentTime,
                                        status : environment.notificationStatus.UNREAD,
                                       
                                       };
                                      
                                      this.firebaseService.createNotification(this.notification);
                                      this.spinner.hide();
                              }
                              //this.spinner.hide();
                            }
                          );
                
                     // });
                    
                    //end
                    //this.toastr.success('Payment has been made.', 'Success');
                  }
                  //this.spinner.hide();
                }
              );
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

  addPaymentDetails() {
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(async data => {
      if (data.status === 200) {        
          this.offerDetails['paymentId'] = data.data._id;
          this.offerDetails.contractStatus = this.offerDetails.INPROGRESS;
          
           //save final offer data
            const isofferType="final";
            this.offerDetails.offerSteps[isofferType].message = this.sendOffer.message;
            this.offerDetails.offerSteps[isofferType].amount =  this.sendOffer.amount;
            this.offerDetails.offerSteps[isofferType].startTime =  this.sendOffer.startTime;
            this.offerDetails.offerSteps[isofferType].endTime =  this.sendOffer.endTime;
            this.offerDetails.offerSteps[isofferType].offerTime =  new Date();
            this.offerDetails.offerSteps[isofferType].offerBy =  environment.USER_TYPE.PRACTICE;
            
          const updateDetails = {
            status: this.offerStatus.CONTRACT,
            contractStatus: environment.CONTRACT_STATUS.UPCOMING,
            finalRate: this.offerDetails.offerSteps[this.offerDetails.offerStatus].amount,
            isApplyied:true,
            offerSteps:this.offerDetails.offerSteps,
            contractStartTime : new Date(),
          };
          const condition = {
            _id: this.offerDetails._id,
            jobPostId: this.offerDetails.jobPostId._id
          };
          
          this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
            data => {
              if (data.status === 200) {
               
              
                let tempJObStatus = environment.JOB_STATUS.FILLED;
                const todaysDate = new Date();
                const offerDate = new Date(this.offerDetails.offerSteps[this.offerDetails.offerStatus].startTime);
                if(todaysDate.getFullYear() === offerDate.getFullYear() && todaysDate.getMonth() === offerDate.getMonth() && todaysDate.getDate() === offerDate.getDate() ){
                  tempJObStatus= environment.JOB_STATUS.INPROGRESS
                }
                const newJob = {
                  _id: this.offerDetails.jobPostId._id,
                  status: tempJObStatus
                };
                
                this.changeJobStatus(newJob);
                this.router.navigate(['staff/assignments/details',this.offerDetails._id]);
                this.closeModel();
                this.spinner.hide();
                this.toastr.success('Offer accepted successfully.', 'Success');
                const condition1 = {
                  _id: { $ne: this.offerDetails._id },
                  jobPostId: this.offerDetails.jobPostId._id,
                  $or: [
                    { status: this.offerStatus.OFFER },
                    { status: this.offerStatus.CONTRACT },
                    { status: this.offerStatus.APPLYED}
                  ],
                };
                    this.offerService.getAllOffers({ condition1 }).subscribe(
                      data => {
                        if (data.status === 200) {
                          if (data.data.length > 0) {
                            this.declineStaffList = data.data;
                          }
                          //this.contractDetail = this.offerDetails;
                          this.declineOtherOffers(this.offerDetails);
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
  }

  declineOtherOffers(offerDetails) {
    const offerDecline = {
      reason: 'Due to the job was filled',
      declineTime: moment().toISOString(),
      declineBy: environment.USER_TYPE.PRACTICE,
    };
    this.contractDetail = offerDetails;
    const updateDetails = {
      status: this.offerStatus.DECLINE,
      offerDecline: offerDecline
    };
    const condition = {
      _id: { $ne: this.contractDetail._id },
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT },
        { status: this.offerStatus.APPLYED },
      ],
      jobPostId: this.contractDetail.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('autodecline', offerDecline.reason);
          // this.common.incDecUsersCount(this.contractDetail.practiceId, 'staffHired', true);
          // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', true);
         // this.updateOfferStatus('Contract has been activated.', 'activateContract');
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
    const fullName = this.offerDetails.practiceId.firstName + ' ' + this.offerDetails.practiceId.lastName;
    const title = this.contractDetail.jobPostId.jobTitle.toString();
    const jobId = this.contractDetail.jobPostId._id;
    // const message = this.cancelContractDetail.reason;
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    this.declineStaffList.map(value => {
      const menuCount = (value.sendOfferByPractice) ? ({ sentOffer: 0, receivedOffer: 1, contract: 0 }) :
        ({ sentOffer: 1, receivedOffer: 0, contract: 0 });
      const id = value._id;
      this.notification = {
        senderId: this.currentUser._id,
        receiverId: value.staffId._id,
        message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
        redirectLink: notification[type].staffLink,
        type: notification[type].type,
        offerId: id,
        jobId: jobId,
        staff: menuCount,
        practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
        createdAt: currentTime,
        updatedAt: currentTime,
        status: environment.notificationStatus.UNREAD
      };
      this.firebaseService.createNotification(this.notification);
    });
  }

  updateOfferStatus(message: string, type?: String) {
    this.offerService.addOffer(this.contractDetail).subscribe(
      data => {
        this.spinner.hide();
        //this.stripeModal.hide();
        if (data.status === 200) {
          if (type === 'activateContract') {
            this.sendNotification('activateContract',this.contractDetail._id);
          } else if (type === 'cancelContract') {
            this.sendNotification('cancelContract',this.contractDetail._id);
          } else if (type === 'endContract') {
            this.sendNotification('endContract',this.contractDetail._id);
          }
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
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      });
  }


  //change job status

  changeJobStatus(newJob) {
    this.jobsService.saveJob(newJob).subscribe(
      data => {
        if (data.status === 200) {
          this.showButtonCond.acceptOffer = false;
          this.showButtonCond.declineOffer = false;
          this.staffNotification['contract'] = 1;
          this.sendNotification('finalOffer',0);
          //this.toastr.success('Offer has been accepted.', 'Success');
          this.spinner.hide();
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
      }
    );
  }
   
getAllOffers(){
  if(this.filterJobList.jobdates) {
    
  }
  // return false;
  savedFilters.jobList = this.filterJobList;
  this.jobsService.searchJobs({filterJobList : this.filterJobList}).subscribe(
    data =>  {
      if (data.status === 200) {
        this.offersList = data.data;
        this.getActivity();
        this.getTotalViewed();
        this.getSaved();
        this.filterJobs(this.jobId);
      }
      });
}

saveViewed(jobId){
  const condition = {
    userId : this.currentUser._id,
    jobId : jobId,
    isViewed : true,
    type : 'Job'
  }
  this.activityService.addActivity(condition).subscribe(data =>{
    if(data.status == 200){
      this.getTotalViewed();
    }
  })
}


getTotalViewed(){
  const condition  = {
    jobId : this.jobId,
    isViewed : true,
    type : 'Job' 
  }
  this.activityService.getActivityJob(condition).subscribe(data =>{
    if(data.status == 200){
        this.activityData = data.data.length;
      }
    });
}

saveJobAsActivity(){
  let condition;
  if(this.isSaved){
    condition = {
      _id : this.activityDetails[0]._id,
      isSaved : false,
      type : 'Job'
    }
    this.isSaved = false;
    this.toastr.success('Job unsaved successfully.','Success');
  }else{
    condition = {
    _id : this.activityDetails[0]._id,
    isSaved : true,
    type : 'Job'
  }
  this.isSaved = true;
  this.toastr.success('Job saved successfully.','Success');
}
  this.activityService.updateActivity(condition).subscribe(data =>{
    if(data.status == 200){
      this.getSaved();
    } else {
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    }
  },
  error => {
    this.toastr.error(
      'There are some server Please check connection.',
      'Error'
    );
  })
}


getSaved(){
  const condition  = {
    jobId : this.jobId,
    isSaved : true,
    type : 'Job' 
  }
  this.activityService.getActivityJob(condition).subscribe(data =>{
    if(data.status == 200){
        this.totalSaved = data.data.length;
      }
    });
}


getActivity(){
  const condition  = {
    userId : this.currentUser._id,
    jobId : this.jobId,
    type : 'Job' 
  }
  this.activityService.getActivityJob(condition).subscribe(data =>{
    if(data.status == 200){
      if(data.data.length > 0){
        this.activityDetails = data.data;
        if(this.activityDetails[0].isSaved){
          this.isSaved = true;
        }
      }else{
        this.saveViewed(this.jobId);
      }
    }
  })
}



filterJobs(jobId){
  this.showButtonCond = {
    acceptOffer : false,
    declineOffer : false,
    counterOffer : false,
    // finalOffer : false,
    waitingMsg : false,
    declineMsg : false,
    deleteOffer: false,
    expiredMsg: false,
    appliedOffer:false,
  };
  this.jobId = jobId;
  this.getOfferDetails();
  let url = '/job-details/'+jobId;
  this.location.go(url);
  let temp: any;
  this.offersList.map((ele,i) =>{
    if(ele._id === jobId){
      temp = this.offersList[i];
      this.offersList[i] = this.offersList[0];
      this.offersList[0] = temp;
    }
  })
  $('html, body, .list-load').animate({
    scrollTop: 0
  }, 600);
}

getAddress(){
const condition = {
  _id : this.jobDetail.practiceName
}
  this.addressService.getAddressList({condition}).subscribe(data =>{
    if(data.status == 200){
      this.address = data.data;
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
  }
);
}

copyUrl(){
  if(location.hostname === 'localhost'){
    this.url = location.hostname +':4200/#'+ this.router.url;
  }else{
    this.url = location.hostname +'/#'+ this.router.url;
  }
 
}

onSuccess(e) {
  this.toastr.success('Job link copied to clipboard','Success');
  this.copiedText = e.text;
}

onError(e) {
  this.copiedText = 'Error trying to copy your text';
}

closingJobDaysAgo(){
  const todayDate = new Date();  
  const startDate = new Date(this.jobDetail.expireDate);  
  this.jobClosing = Math.round((startDate.getTime() - todayDate.getTime())/(1000 * 60 * 60 * 24));
}

postedJobDaysAgo(){
  const createdDate = new Date(this.jobDetail.updatedAt);  
  const todayDate = new Date();  
  this.postetdDaysAgo = Math.round((todayDate.getTime() - createdDate.getTime())/(1000 * 60 * 60 * 24));
}

calculateClosingJob(expireDate){
  const todayDate = new Date();  
  const startDate = new Date(expireDate);  
  return (Math.round((startDate.getTime() - todayDate.getTime())/(1000 * 60 * 60 * 24)));
}

openBackPage(){
  this.router.navigate([this.backRoute]);
}

getPositionType(positionId){
  const condition = {
    _id : positionId
  }
  this.positionTypeService.getPositionType({condition}).subscribe(data => {
    if(data.status == 200){
      this.staffPositionType = data.data[0].name;
      this.showApplyButtonsOnPosition();
    }
  })
}

showApplyButtonsOnPosition(){
  if(this.staffPositionType.toLowerCase().trim() === 'administration' && (this.jobDetail.positionType.toLowerCase().trim() !== 'dentist' && this.jobDetail.positionType.toLowerCase().trim() !== 'dental hygienist'))
  {
    this.showButton = true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dental assistant' && (this.jobDetail.positionType.toLowerCase().trim() !== 'dentist' && this.jobDetail.positionType.toLowerCase().trim() !== 'dental hygienist')){
    this.showButton = true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dental hygienist' && (this.jobDetail.positionType.toLowerCase().trim() !== 'dentist')){
    this.showButton = true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dentist'){
    this.showButton = true;
  }
  else if(this.staffPositionType.toLowerCase().trim() === 'dentist certification'){
    this.showButton = true;
  }
  else{
    this.showButton = false;
  }
}

openSocialLink(id){
  if(id == 1){
    window.open("https://www.facebook.com/sharer/sharer.php?u=https://"+this.url, '_blank').focus();
  }
  if(id == 2){
    window.open("https://www.linkedin.com/sharing/share-offsite/?url=https://"+location.hostname, '_blank').focus();
  }
  if(id == 3){
    window.open("https://twitter.com/intent/tweet?url=https://"+this.url, '_blank').focus();
  }
}

showNegotiateMsfg(){
  if(this.jobDetail.jobType === this.jobTypes.TEMPORARY){
    this.toastr.success('To submit an application with counter offer, you must at least change one of the following parameters: start time, end time and / or the rate.','Alert',{timeOut:10000})
  }else{
  this.toastr.success('To submit an application with counter offer, you must change the pay rate','Alert',{timeOut:10000})
  }
}

shortCompanyName(cName){
  if(cName.length > 20){
    cName = cName.substr(0,19);
    cName = cName + '...';
    return cName
  }else{
    return cName;
  }
}
shortPracticeName(pName){
  if(pName.length > 20){
    pName = pName.substr(0,19);
    pName = pName + '...';
    return pName
  }else{
    return pName;
  }
}


navigateBackToCurrentPage(){
    this.globalService.showBackButtonOnPracticePublicPage = '/job-details/'+this.jobDetail._id;
}
}

