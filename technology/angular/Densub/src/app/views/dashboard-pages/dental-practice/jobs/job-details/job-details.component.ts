import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { StripeSource } from 'stripe-angular';
import { filter, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import { PositionTypeService } from '../../../../../shared-ui/service/positionType.service';
import { StripeService } from '../../../../../shared-ui/service/stripe.service';
import { PaymentDetails } from '../../../../../shared-ui/modal/payment.modal';
import { PaymentService } from '../../../../../shared-ui/service/payment.service';
import { WorkDiary } from '../../../../../shared-ui/modal/work-diary.modal';
import { Dispute } from '../../../../../shared-ui/modal/dispute.modal';
import { DisputeService } from '../../../../../shared-ui/service/disputes.service';
import { RatingService } from '../../../../../shared-ui/service/rating.service';
import { Rating } from '../../../../../shared-ui/modal/rating.modal';

import { ContractDetailsComponent } from '../../contracts/contract-details/contract-details.component';

import { currentUser } from '../../../../../layouts/home-layout/user.model';
import { JobNewPost } from '../../../../../shared-ui/modal/job.modal';
import { Notification } from '../../../../../shared-ui/modal/notification.modal';
import { Offer } from '../../../../../shared-ui/modal/offer.modal';
import { Users } from '../../../../../shared-ui/modal/users.modal';
import { JwtService } from '../../../../../shared-ui/service/jwt.service';
import { EventEmitterService } from '../../../../../shared-ui/service/event-emitter.service';
import { JobsService } from '../job-posts/jobs.service';
import { FirebaseService } from '../../../../../shared-ui/service/firebase.service';
import { WorkDiaryService } from '../../../../../shared-ui/service/workDiary.service';
import { OfferService } from '../../../../../shared-ui/service/offer.service';
import { TimesheetService } from '../../../../../shared-ui/service/timesheet.service';
import { Common } from '../../../../../shared-ui/service/common.service';
import { GlobalService } from '../../../../../shared-ui/service/global.service';
import { UsersService } from '../../../../../shared-ui/service/users.service';
import { environment } from '../../../../../../environments/environment';
import { AddEditPostComponent } from '../../../../../shared-ui/add-edit-post/add-edit-post.component';
import { StaffProfile } from '../../../../../shared-ui/modal/staff-profile.modal';
import { AddressService } from '../../../../../shared-ui/service/address.service';
import { Address } from '../../../../../shared-ui/modal/address.modal';
import { AngularFireDatabase } from '@angular/fire/database';
import { inArray } from 'highcharts';
import { FavoriteService } from '../../../../../shared-ui/service/favorite.service';
import { PaymentCardService } from '../../../../../shared-ui/service/paymentCard.service';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ThrowStmt } from '@angular/compiler';
@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})

export class JobDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('offerJobModal', { static: false }) public offerJobModal: ModalDirective;
  @ViewChild('declineJobModal', { static: false }) public declineJobModal: ModalDirective;
  @ViewChild('messageModal', { static: false }) public messageModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  @ViewChild('editJobModal', { static: false }) public editJobModal: ModalDirective;
  @ViewChild('invitedListModal', { static: false }) public invitedListModal: ModalDirective;
  @ViewChild('activatePracticeAccount', { static: false }) public activatePracticeAccount: ModalDirective;
  @ViewChild('viewBreakDetail', { static: false }) public viewBreakDetail: ModalDirective;
  @ViewChild('cancelContractModal', { static: false }) cancelContractModal: ModalDirective;
  @ViewChild('messageFromStaff', { static: false }) messageFromStaff: ModalDirective;
  @ViewChild('jobDescription', { static: false }) jobDescription: ModalDirective;
  // @ViewChild('stripeModal', { static: false }) stripeModal: ModalDirective;
  // @ViewChild('stripeSource', { static: false }) stripeSource: StripeSource;
  @ViewChild('reasonModal', { static: false })
  public reasonModal: ModalDirective;
  @ViewChild('viewCancleModal', { static: false }) viewCancleModal: ModalDirective;

  public destroyed = new Subject<any>();
  newJob: JobNewPost = new JobNewPost();
  jobId = '';
  messageModalDetails = '';
  offersList: any = [];
  offersList1: any = [];
  invitationsList = [];
  invitationsList1: any = [];
  invitedStaffList = [];
  invitationListForJob = [];
  addressCondition = [];
  currentUser: currentUser = new currentUser;
  jobDetail: any = new JobNewPost();
  currentUser1: any = new Users();
  offerDetails: any = new Offer();
  contractDetail: any = new Offer();
  currentContractDetails: any = new Offer();
  jobTypes = environment.JOB_TYPE;
  userTypes = environment.USER_TYPE;
  newUsersName = environment.NEW_USERS_NAME;
  timeSheetStatus = environment.TIMESHEET_STATUS;
  viewProfileLink = '/#/staff-profile';
  // jobTabs: string[] = ['Invitations','Applications','Timesheets','Payments'];
  // selectedJobTab = this.jobTabs[0];
  invitationsCount: number = 0;
  applicationsCount: number;
  jobStatusFlag = false;
  hireCount = 0;
  allPositions:any;
  currentofferDetails:any=[];
  hireFlag = false;
  hiredOffer: any = new Offer(); 
  tabCount = 0;
  termsAndConditions = true;
  cards: any = { exp_month: '', exp_year: ''};
  cancelContractDetail: any = { reason: '', cancelTime: '', cancelBy: '' };
  comissionAmount: any = 0;
  workDiary:any=[];
  currnetDateTime :any = moment();
  rateFlag = false;
  showOfflineMode: Boolean = false;
  checkSign: Boolean = false;
  //isOffered = true;
  /* editorConfig: any = {
    editable: true,
    spellcheck: true,
    height: '200px',
    // width: '200px',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    toolbar: [
      [
        'bold',
        'italic',
        'underline',
        'orderedList',
        'unorderedList'
      ],
    ]
  };
  editorConfigMsg: any = {
    editable: true,
    spellcheck: true,
    height: '200px',
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false,
  }; */
  public isCollapsedJobDetail = true;
  ckeConfig: any = {
    //allowedContent: false,
    forcePasteAsPlainText: true,
    height: 150,
    toolbarGroups: [
      { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
      { name: 'paragraph', groups: ['list'] },
    ],
    removeButtons: 'Source,Save,NewPage,Preview,Print,Templates,Cut,Copy,Paste,PasteText,PasteFromWord,Undo,Redo,Find,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,Strike,Subscript,Superscript,CopyFormatting,RemoveFormat,Outdent,Indent,CreateDiv,Blockquote,BidiLtr,BidiRtl,Language,Unlink,Anchor,Image,Flash,Table,HorizontalRule,Smiley,SpecialChar,PageBreak,Iframe,Maximize,ShowBlocks,About',
  };
  notification: any = new Notification();
  declinedMessage = '';
  offerType = environment.OFFER_TYPE;
  offerStatus = environment.OFFER_STATUS_NEW;
  contractStatus = environment.CONTRACT_STATUS;
  paymentMethod = environment.PAYEMENT_METHOD;
  notificationType = environment.NOTIFICATION_TYPE;
  jobStatus = environment.JOB_STATUS;
  sendOfferDetails = {
    amount: 0,
    message: '',
    startTime: '',
    endTime: ''
  };
  requestReason = {
    message: '',
    saved_on: undefined
  };
  sendMessage = '';
  currentIndex = -1;
  currentoffer = '';
  isDeleteOffer: Boolean = false;
  deleteModalMessage = {
    heading: '',
    message: '',
    type: ''
  };
  isDeleteWarningModal = false;
  links = [
    { title: 'One', fragment: 'one' },
    { title: 'Two', fragment: 'two' }
  ];
  jobStatusColor: any = environment.JOB_STATUS_COLOR;
  closeResult: String;
  staffNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
  declineStaffList: any = [];
  todaysDate: any;

  jobTabsNew: any = [{
    _id: 0,
    lable: 'Applications',
    count1: this.invitationsCount
  },
  {
    _id: 1,
    lable: 'Hired',
    count1: this.invitationsCount
  }, {
    _id: 2,
    lable: 'Timesheet'
  },
  {
    _id: 3,
    lable: 'Payment'
  }];
  selectedJobTab = this.jobTabsNew[0]._id;
  timesheetWorkDiary = [];
  itemsPerPage = 3;
  timesheetPerPage = 3;
  
  totalHoursWorked = 0;
  //staffProfileInfo: any = new StaffProfile();
  staffProfileInfo = [];
  address: any = new Address();
  clockInTimesheet: any;
  clockOutTimesheet: any;
  durations: any = [];
  timesheet: any = [];
  totalBreakTime: any = {};
  breakTimeTillnow: any;
  breakTime: any;
  currentOfferAmount: any;
  currentStartTime: any;
  currentEndTime: any;
  isContractRevoke: boolean;
  methodFlag: string;
  staffName: any;
  showPaymentFlag: boolean = false;
  showOfflinePayment: boolean = false;
  currentJobDescription: any;
  timeModalDetails: any;
  rejectRevisionMessageFlag: boolean = false;
  revisionData={ rejected: [], requested:[]};
  markAsPaid: boolean = false;
  timesheetNotSubmitted: boolean = true;
  ratingCount: any = 0;
  msgDisplayed: boolean = false;
  // paymentDetails: any = new PaymentDetails();
  // timeSheetPayment=false;


  constructor(
    private jwtService: JwtService,
    private route: ActivatedRoute,
    private jobsService: JobsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private offerService: OfferService,
    private firebaseService: FirebaseService,
    private ngBoostrapModalService: NgbModal,
    private router: Router,
    private common: Common,
    public globalService: GlobalService,
    private usersService: UsersService,
    private workDiaryService: WorkDiaryService,
    private addressService: AddressService,
    private db: AngularFireDatabase,
    private timesheetService: TimesheetService,
    private favoriteService: FavoriteService,
    private eventEmitterService: EventEmitterService,
    private modalService: NgbModal,
    private positionTypeService: PositionTypeService,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    private disputeService: DisputeService,
    private ratingService: RatingService,
    private PaymentCardService: PaymentCardService,

  ) {
    this.currentUser = this.jwtService.currentLoggedUserInfo;

    this.route.params.subscribe(res => {
      this.jobId = res.jobId;
      // this.getJobDetails();
      // this.getBids();
    });
  }
  state$: Observable<object>;
  navChange() {
    this.state$ = this.route.paramMap
      .pipe(map(() => window.history.state))
    if (window.history.state.openedNav == "open") {
      this.selectedJobTab = this.jobTabsNew[0]._id;
    } else if (window.history.state.openedNav == "filled") {
      this.selectedJobTab = this.jobTabsNew[1]._id;
    } else if (window.history.state.openedNav == "inProgress") {
      this.selectedJobTab = this.jobTabsNew[1]._id;
    } else if (window.history.state.openedNav == "aap") {
      this.selectedJobTab = this.jobTabsNew[2]._id;
    } else if (window.history.state.openedNav == "completed") {
      this.selectedJobTab = this.jobTabsNew[3]._id;
    }
  }
  ngOnInit(): void {
    this.navChange();
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd),
      pairwise(),
      filter((events: RouterEvent[]) => events[0].url === events[1].url),
      startWith('Initial call'),
      takeUntil(this.destroyed)
    ).subscribe(() => {
      this.getJobDetails();
      this.getOffers();
      this.getInvitations();
      this.getAllPositionTypes();
      this.todaysDate = new Date();
      this.selectedWork.offlinePyamentType = environment.OFFLINE_PAYMENT_TYPE.INPERSON;
    });
   // this.getTimesheet();
    // this.getPaymentDetails();
    this.currentUser = this.jwtService.currentLoggedUserInfo;
    this.route.params.subscribe((res) => {
      this.getContract(res.jobId);
      this.getAdminInfo();
    });
  }
  paymentDetailss;
  paymentDetailsStaff;
  getPaymentDetails(staffId) {
    // let currentStaffId:any;
    // if(this.offersList1.length >0){
    //   currentStaffId = this.offersList1[0].staffId._id;
    // }else if(this.invitationsList1.length >0){
    //   currentStaffId = this.invitationsList1[0].staffId._id;
    // }else{
    //   currentStaffId = null;
    // }
    this.paymentService.getPaymentDetails({ staffId: staffId, jobId: this.jobId }).subscribe(
      data => {
        // console.log(data);
        if (data.status === 200) {
          for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].receiverUserId == undefined) {
              this.paymentDetailss = data.data[i];
            } else {
              this.paymentDetailsStaff = data.data[i];
            }
          }
          //console.log(this.paymentDetailss.receiverUserId);
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
      }
    );
  }
  getAdminInfo() {
    this.usersService.getAdminInfo({}).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.adminId = data.data._id;
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
      }
    );
  }
  newTimesheet = [];
  getTimesheet() {
    this.workDiaryService.getworkDiaryDetailsForProduct({ practiceId: this.currentUser._id, jobId: this.jobId }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          const array = data.data.filter(arr => {
            const t1 = new Date(arr.date);
            const d1 = t1.getFullYear() + '-' + (t1.getMonth() + 1) + '-' + t1.getDate();
            const t2 = new Date(moment(new Date()).toISOString())
            const d2 = t2.getFullYear() + '-' + (t2.getMonth() + 1) + '-' + t2.getDate();
            return Date.parse(d1) === Date.parse(d2);
          })
          this.timesheetWorkDiary = array.filter(arr => arr.jobPostId === this.jobId) || [];
          this.clockInTimesheet = this.timesheetWorkDiary.filter(sheet => sheet.timeClockStatus === 'In progress - Clocked In');
          this.timesheetService.getTimesheetDetails({ practiceId: this.currentUser._id }).subscribe(data => {
            if (data.status === 200) {
              if (data.data.length > 0) {
                data.data.map(arr => {
                  if (arr.jobPostId === this.jobId) {
                    this.timesheet.push(arr);
                  }
                });
                const clockouts = this.timesheetWorkDiary.filter(sheet => sheet.timeClockStatus === 'In progress - On break') || [];
                if (clockouts.length > 0) {
                  const duration = this.timesheet[0].timeDuration;
                  var d = duration.split(':');
                  var totalWork = (+d[0]) * 60 * 60 + (+d[1]) * 60 + (+d[2]);
                  const startTime = new Date(this.timesheetWorkDiary[0].startTime).toLocaleTimeString().split(' ')[0];
                  var a = startTime.split(':');
                  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
                  const clockOutTime = clockouts[0].clockOutTime.split(' ')[0];
                  var a1 = clockOutTime.split(':');
                  var seconds1 = (+a1[0]) * 60 * 60 + (+a1[1]) * 60 + (+a1[2]);
                  const totalTime = seconds1 - seconds;
                  const temp = totalTime - totalWork;
                  const totalBreakTime = new Date(temp * 1000).toISOString().substr(11, 8);
                  this.breakTime = totalBreakTime;
                  const temp1 = totalBreakTime.split(':');
                  this.totalBreakTime = { hours: temp1[0], minutes: temp1[1] };
                }
              }
            }
          });
          let clockOuts = [], clockIns = [];
          this.timesheetWorkDiary.map(sheet => {
            if (sheet.timeClockStatus === 'In progress - On break') {
              clockOuts.push(sheet.clockOutTime.split(' ')[0]);
            }
            if (sheet.timeClockStatus === 'In progress - Clocked In') {
              clockIns.push(sheet.clockInTime.split(' ')[0]);
            }
          });
          clockIns.reverse();
          clockOuts.reverse();
          for (let i = 0; i < this.timesheetWorkDiary.length; i++) {
            if (clockOuts[i] !== undefined && clockIns[i + 1] !== undefined) {
              const diff = clockOuts[i].split(':').map((item, index) => Math.abs(clockIns[i + 1].split(':')[index] - item)).join(':');
              var temp = diff.split(':');
              const seconds = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);
              const hour = Math.floor(seconds / 3600);
              const minute = Math.floor(seconds / 60);
              this.durations.push({ clockIn: clockIns[i + 1], clockOut: clockOuts[i], duration: { hour, minute } });
            }
          }
        }
        for (let i = 0; i < data.data.length; i++) {
          if (this.jobId == data.data[i].contractId.jobPostId) {
            this.newTimesheet.push(data.data[i]);
            this.timesheetNotSubmitted = false;
            if(data.data[i].paidStatus == "pending"){
              this.showPaymentFlag =false;
            }else if(data.data[i].paidStatus == "paid" && data.data[i].paymentDetails.paymentType =="online"){
              this.showPaymentFlag =true;
            }else if(data.data[i].paidStatus == "paid" && data.data[i].paymentDetails.paymentType =="offline"){
              this.showOfflinePayment =true;
            }
          }
        }
      } else {
        this.toastr.error('There are some server Please check connection.', 'Error');
      }
    }, error => {
      this.toastr.error(
        'There are some server Please check connection.', 'Error');
    });
  }

  timesheetAmountCal(time, amount) {
    const minCal = (time.hours > 0) ? (time.hours * amount) : 0;
    const hourCal = (time.minutes > 0) ? ((amount * time.minutes) / 60) : 0;
    return Number((minCal + hourCal).toFixed(2));
  }

  getBreakTimeTillnow() {
    const now = new Date().toLocaleTimeString().split(' ')[0];
    const start = this.timesheetWorkDiary[0].clockOutTime.split(' ')[0];
    const diff = start.split(':').map((item, index) => parseInt(now.split(':')[index]) - item).join(':');
    var temp = diff.split(':');
    var seconds = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);
    const hour = Math.floor(seconds / 3600);
    const minute = Math.floor(seconds / 60);
    this.breakTimeTillnow = { hour, minute };
    return hour + ' hours ' + minute + ' minutes';
  }

  getTotalBreak() {
    if (this.timesheetWorkDiary && (this.timesheetWorkDiary[0].timeClockStatus === 'In progress - On break')) {
      const break1 = { hour: parseInt(this.totalBreakTime.hours), minute: parseInt(this.totalBreakTime.minutes) };
      if (this.breakTimeTillnow !== undefined) {
        const totalhours = break1 && this.breakTimeTillnow && (break1.hour + this.breakTimeTillnow.hour);
        const totalMinute = break1 && this.breakTimeTillnow && (break1.minute + this.breakTimeTillnow.minute);
        const totalTimeinSeconds = (totalhours * 60 * 60) + (totalMinute * 60);
        const hour = Math.floor(totalTimeinSeconds / 3600);
        const minute = Math.floor(totalTimeinSeconds / 60);
        return hour + ' hours ' + minute + ' minutes';
      } else {
        return break1.hour + ' hours ' + break1.minute + ' minutes';
      }
    } else {
      let totalH = 0, totalM = 0;
      this.durations.map(arr => {
        totalH += arr.duration.hour;
        totalM += arr.duration.minute;
      });
      return totalH + ' hours ' + totalM + ' minutes';
    }
  }

  isTimePassed(expireDate){
    const dateString = expireDate;
    return !(new Date(dateString).getTime() < new Date().getTime()) ;
  }

  getJobDetails() {
    this.spinner.show();
    const condition = {
      _id: this.jobId
    };
    this.jobsService.getJobsWithDetails({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.jobDetail = data.data[0];
            const jobEndDateTime = new Date(this.jobDetail.endTime);
            const currntDateTime = new Date(this.currnetDateTime._d);
            if(jobEndDateTime < currntDateTime){
              this.rateFlag = true;
            }else{
              this.rateFlag = false;
            }
            this.applicationsCount = this.jobDetail.total.sentStaffOffers;
            this.getAndUpdateJobNotification();
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

  getInvitationStatus(jobId, invitedList) {
    const returnValue: any = [];
    const self = this;
    this.db.database.ref('Notification').orderByChild('jobId').equalTo(jobId).once('value', function (snapshot) {
      snapshot.forEach(snapshotChild => {
        // const  value = snapshotChild.val();
        //returnValue.push(value);
        invitedList.forEach(list => {
          const value = snapshotChild.val();
          if (list.staffId._id === value.receiverId) {
            list.staffId.readStatus = value;
            returnValue.push(list);

          }
        });
      });
      self.saveReturnValue(returnValue);
    });
  }
  saveReturnValue(list) {
    // this.invitedStaffList = list;
    this.invitedStaffList = list.filter(function (list, index, self) {
      return index === self.indexOf(list);
    })
  }
  getAndUpdateJobNotification() {
    // const senderId = this.offerDetails.staffId._id;
    const receiverId = this.jobDetail.createdBy._id;
    const jobId = this.jobDetail._id;
    const status = environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateJobNotification(receiverId, jobId, status);
  }

  messageFromStaffs(message,time=null){
    this.messageModalDetails = message;
    this.timeModalDetails = time;
    this.messageFromStaff.show();
  }

  getOffers() {
    const condition = {
      jobPostId: this.jobId,
      sendOfferByPractice: false
    };
    const sort = {
      updatedAt: -1
    };
    this.offerService.getAllOffers({ condition, sort }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.offersList = data.data;
            this.applicationsCount = data.data.length;

            data.data.forEach(element => {
              const condition = {
                _id: element.staffId._id,
                userType: environment.USER_TYPE.STAFF
              };

              //update the hire count
              if (element.status === environment.JOB_STATUS.CONTRACT) {
                this.hireCount = this.hireCount + 1;
                this.hireFlag = true;
                this.hiredOffer =element;
                //this.selectedJobTab = 1;
              }

              //get user info for expriri
              this.usersService.getUserInfoWithDetails(condition).subscribe(
                data => {
                  if (data.status === 200) {
                    this.spinner.hide();
                    this.staffProfileInfo.push(data.data);
                    element.staffInfo = data.data;
                    this.getTotalJobsWorkedForOffer(element);
                  }
                });

            });
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

  getInvitations() {
    const condition = {
      jobPostId: this.jobId,
      sendOfferByPractice: true
    };
    const sort = {
      updatedAt: -1
    };
    this.offerService.getAllOffers({ condition, sort }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.invitationsList = data.data;
            this.getInvitationStatus(this.jobId, this.invitationsList);
            this.invitationsCount = this.invitationsList.length;
            data.data = data.data.filter( d => {
              if(d.isApplyied){
                return d;
              }
            })
            data.data.forEach(element => {
              const condition = {
                _id: element.staffId._id,
                userType: environment.USER_TYPE.STAFF
              };
              //update the hire count
              if (element.status === environment.JOB_STATUS.CONTRACT) {
                this.hireCount = this.hireCount + 1;
                this.hireFlag = true;
                this.hiredOffer =element;
                //this.selectedJobTab = 1;
              }
              //get user info for expriri
              this.usersService.getUserInfoWithDetails(condition).subscribe(
                data => {
                  if (data.status === 200) {
                    this.spinner.hide();
                    this.staffProfileInfo.push(data.data);
                    element.staffInfo = data.data;
                    this.getTotalJobsWorked(element);
                  }
                });

            });
            // data.data.forEach(element => {
            //   let a = this.address.find(e => e._id === element.staffId._id);
            // });

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

  getTotalJobsWorkedForOffer(element) {
    const condition = {
      staffId: element.staffId._id,
      $or:[
        {contractStatus: environment.CONTRACT_STATUS.COMPLETED},
          {contractStatus: environment.CONTRACT_STATUS.MARKASPAIDSTAFF}
      ]
    };
    this.offerService.getTotal({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data > 0) {
          element.staffInfo.jobs = data.data;
          this.getTotalHoursWorkedForOffer(element);
        } else {
          element.staffInfo.jobs = 0;
          this.getTotalHoursWorkedForOffer(element);
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

  getTotalJobsWorked(element) {
    const condition = {
      staffId: element.staffId._id,
      contractStatus: environment.CONTRACT_STATUS.COMPLETED
    };
    this.offerService.getTotal({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data > 0) {
          element.staffInfo.jobs = data.data;
          this.getTotalHoursWorked(element);
        } else {
          element.staffInfo.jobs = 0;
          this.getTotalHoursWorked(element);
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

  getTotalHoursWorkedForOffer(element) {
    const condition = {
      staffId: element.staffId._id
    };
    this.workDiaryService.getTotalHours({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.totalHoursWorked = data.data;
          element.staffInfo.workedHours = data.data.toFixed(2);
          this.getAddressListForOffer(element);
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

  getTotalHoursWorked(element) {
    const condition = {
      staffId: element.staffId._id
    };
    this.workDiaryService.getTotalHours({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          this.totalHoursWorked = data.data;
          element.staffInfo.workedHours = data.data.toFixed(2);
          this.getAddressList(element);

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

  getAddressListForOffer(element) {
    const condition = { userId: element.staffId._id };
    this.addressService.getAddressWithDetails({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.address = data.data[0];
            element.staffInfo.address = this.address;
            this.getFavoriteList(element.staffId._id, element);
          } else {
            this.getFavoriteList(element.staffId._id, element);
          }

        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  getFavoriteList(userId2, element) {
    const condition = {
      favoriteId: userId2,
      type: environment.FAVORITE_TYPE.STAFF,
      userId: this.currentUser._id
    };
    this.favoriteService.getFavorite({ condition: condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            element.staffInfo.isFavorites = true;
            this.offersList1.push(element);
            this.offersList.push(element);
          } else {
            element.staffInfo.isFavorites = false;
            this.offersList1.push(element);
            this.offersList.push(element);
          }
          
          this.checkStatusAndChangeTheTab(this.offersList1);
          this.checkRejectRevision();
        }

        this.mergePositionType(this.offersList1);
        this.isCancelJob(this.offersList1);
        this.getPaymentDetails(element.staffId._id);
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

  assignArrayOfObject(){
    if(this.invitationsList1.length > 0){
      this.currentofferDetails = this.invitationsList1;
    }else{
      this.currentofferDetails = this.offersList1;
    }
  }
  checkRejectRevision(){
    if(this.invitationsList1.length > 0){
      this.currentofferDetails = this.invitationsList1;
      this.setRejectRevisionFlag();
    }else{
      this.currentofferDetails = this.offersList1;
      this.setRejectRevisionFlag();
    }
  }

  setRejectRevisionFlag(){
    this.currentofferDetails.forEach(element => {
      //to get rejected Revision  
      if(element.rejectRevisionStatus){
          if(element.rejectRevisionStatus.length > 0){
            this.rejectRevisionMessageFlag = true;
            this.revisionData['rejected'].push(element);
          }
        }
      //to get requested Revision
      if(element.requestRevisionStatus){
        if(element.requestRevisionStatus.length > 0){
          this.rejectRevisionMessageFlag = true;
          this.revisionData['requested'].push(element);
        }
      }      
    });
    
  }
 

  getAddressList(element) {
    const condition = { userId: element.staffId._id };
    this.addressService.getAddressWithDetails({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.address = data.data[0];
            element.staffInfo.address = this.address;
            this.invitationsList1.push(element);
          } else {
            this.invitationsList1.push(element);
          }
          console.log(this.invitationsList1);
          this.checkStatusAndChangeTheTab(this.invitationsList1);
          this.mergePositionType(this.invitationsList1);
          this.isCancelJob(this.invitationsList1);
          
          this.getPaymentDetails(element.staffId._id);
          this.checkRejectRevision();
          //check flag
          // if(this.invitationsList1.offerStatus !=='initial' || this.invitationsList1.status !=='decline'){
          //   this.jobStatusFlag=false;
          // }else{
          //   this.jobStatusFlag = true;
          // }
        } else {
          this.globalService.error();
        }
      }, error => {
        this.globalService.error();
      });
  }

  viewBreakDetails(work) {
    this.workDiary = JSON.parse(JSON.stringify(work));
    this.viewBreakDetail.show();
  }

  setButtonCondition(offerDetails, type: String) {
    if (type === 'acceptOffer') {
      return (offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF));

    } else if (type === 'declineOffer') {
      return (offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF));

    } else if (type === 'counterOffer') {
      //   (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
      //   && !offerDetails.sendOfferByPractice
      //   && (this.offerType.INITIAL === offerDetails.offerStatus)
      //   && !(this.isSameTimeAmount(offerDetails))
      //   ),'++++++++++++++++++++++++++++++')
      return (offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
        && !offerDetails.sendOfferByPractice
        && (this.offerType.INITIAL === offerDetails.offerStatus)
        && !(this.isSameTimeAmount(offerDetails))
      );
    } else if (type === 'waitingMsg') {
      return (offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.PRACTICE));
    } else if (type === 'deleteOffer') {
      return ((offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE) &&
        offerDetails.offerStatus === this.offerType.INITIAL));
    } else if (type === 'recounteroffer') {
      return ((offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF) &&
        offerDetails.offerStatus === this.offerType.COUNTER));
    } else if (type === 'applyed') {
      return ((offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === environment.OFFER_STATUS_NEW.APPLYED &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE) &&
        offerDetails.offerStatus === this.offerType.INITIAL));
    }

    //  else if (type === 'finalOffer') {
    //   return (offerDetails.status === this.offerStatus.OFFER &&
    //     (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
    //     && offerDetails.sendOfferByPractice
    //     && (this.offerType.COUNTER === offerDetails.offerStatus)
    //     );
    // }
  }

  setButtonConditionForOffer(offerDetails, type: String) {
    if (type === 'acceptOffer') {
      return (offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF));

    } else if (type === 'declineOffer') {
      return (offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF));

    } else if (type === 'counterOffer') {
      //   (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
      //   && !offerDetails.sendOfferByPractice
      //   && (this.offerType.INITIAL === offerDetails.offerStatus)
      //   && !(this.isSameTimeAmount(offerDetails))
      //   ),'++++++++++++++++++++++++++++++')
      return (offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
        && !offerDetails.sendOfferByPractice
        && (this.offerType.INITIAL === offerDetails.offerStatus)
        && !(this.isSameTimeAmount(offerDetails))
      );
    } else if (type === 'waitingMsg') {
      return (offerDetails.status === this.offerStatus.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.PRACTICE));
    } else if (type === 'deleteOffer') {
      return ((offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE) &&
        offerDetails.offerStatus === this.offerType.INITIAL));
    } else if (type === 'recounteroffer') {
      return ((offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === environment.OFFER_STATUS_NEW.OFFER &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.STAFF) &&
        offerDetails.offerStatus === this.offerType.COUNTER));
    } else if (type === 'applyed') {
      return ((offerDetails.jobPostId.status !==this.offerStatus.EXPIRED && offerDetails.status === environment.OFFER_STATUS_NEW.APPLYED &&
        (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === environment.USER_TYPE.PRACTICE) &&
        offerDetails.offerStatus === this.offerType.INITIAL));
    }

    //  else if (type === 'finalOffer') {
    //   return (offerDetails.status === this.offerStatus.OFFER &&
    //     (offerDetails.offerSteps[offerDetails.offerStatus].offerBy === this.userTypes.STAFF)
    //     && offerDetails.sendOfferByPractice
    //     && (this.offerType.COUNTER === offerDetails.offerStatus)
    //     );
    // }
  }

  isSameTimeAmount(offer): Boolean {
    const offerStartTime = moment(offer.offerSteps[offer.offerStatus].startTime).format('hh:mm a');
    const offerEndTime = moment(offer.offerSteps[offer.offerStatus].endTime).format('hh:mm a');
    const jobStartTime = moment(offer.jobPostId.startTime).format('hh:mm a');
    const jobEndTime = moment(offer.jobPostId.endTime).format('hh:mm a');
    const offerAmount = offer.offerSteps[offer.offerStatus].amount;
    const isHourlyMatch = (this.paymentMethod.HOURLY === offer.jobPostId.paymentMethod &&
      offer.jobPostId.desiredHourlyRate === offerAmount);
    const isSalaryMatch = (this.paymentMethod.SALARY === offer.jobPostId.paymentMethod &&
      offer.jobPostId.desiredSalaryRate === offerAmount);
    if ((offerStartTime === jobStartTime) && (offerEndTime === jobEndTime) && (isHourlyMatch || isSalaryMatch)) {
      return true;
    } else {
      return false;
    }
  }

  showModal(offerDetails, type, index, currentoffer = '') {
    this.offerDetails = JSON.parse(JSON.stringify(offerDetails));
    this.currentIndex = index;
    if (type === 'offerJobModal') {
      this.currentoffer = currentoffer;
      this.sendOfferDetails.amount = this.offerDetails.offerSteps[offerDetails.offerStatus].amount;
      this.sendOfferDetails.startTime = this.offerDetails.offerSteps[offerDetails.offerStatus].startTime;
      this.sendOfferDetails.endTime = this.offerDetails.offerSteps[offerDetails.offerStatus].endTime;
      this.offerJobModal.show();
    } else if (type === 'declineJobModal') {
      this.declineJobModal.show();
    } else if (type === 'messageModal') {
      this.checkPreviousRecipents();
    } else if (type === 'payToActivate') {
      this.activatePracticeAccount.show();
    } else if (type === 'counterOfferJobModal') {
      this.currentoffer = currentoffer;
      this.sendOfferDetails.amount = this.offerDetails.offerSteps[offerDetails.offerStatus].amount;
      this.sendOfferDetails.startTime = this.offerDetails.offerSteps[offerDetails.offerStatus].startTime;
      this.sendOfferDetails.endTime = this.offerDetails.offerSteps[offerDetails.offerStatus].endTime;
      this.currentOfferAmount = this.offerDetails.offerSteps[offerDetails.offerStatus].amount;
      this.currentStartTime = this.offerDetails.offerSteps[offerDetails.offerStatus].startTime;
      this.currentEndTime = this.offerDetails.offerSteps[offerDetails.offerStatus].endTime;  
      this.getRatingsCount()    
      this.getTheCardInfo();
    }
  }

  getTheCardInfo(){
    const email = this.offerDetails.practiceId.email;
    this.PaymentCardService.getPaymentCardDetail({ email }).subscribe(
      data => {
        if (data.status === 200) {
          console.log(data);
          this.cards.exp_month = data.data[0].exp_month;
          this.cards.exp_year = data.data[0].exp_year;
          this.offerJobModal.show();
        }
      });
  }
  showInvitedModal() {
    this.invitedListModal.show();
  }

  checkPreviousRecipents() {
    const s = this.firebaseService.GetDataList('UserMessageRecipient');
    s.snapshotChanges().subscribe(data => {
      data.forEach(item => {
        const a = item.payload.toJSON();
        const keys = Object.keys(a['recipients']);
        if (keys[keys.indexOf(this.currentUser._id)] === this.currentUser._id) {
          keys.splice(keys.indexOf(this.currentUser._id), 1);
          const partnerID = keys[0];
          if (partnerID === this.offerDetails.staffId._id) {
            this.getMessagesThread(a);
          }
        }
      });
    });
  }

  getMessagesThread(thread) {
    const s = this.firebaseService.GetData('UserMessage', thread.$key);
    s.snapshotChanges().subscribe(data => {
      if (data) {
        this.resetOfferDetails();
        this.router.navigate(['../../../../messaging']);
      } else {
        this.messageModal.show();
      }
    });
  }

  submitReasonModel(){
    if(this.newTimesheet.length>0){
      this.requestReason.saved_on = new Date();
      const updateDetails = {
        isContractRead : false,
        requestRevisionStatus:this.requestReason
      }
      const condition = {
        _id: this.newTimesheet[0].contractId._id,           
        practiceId: this.newTimesheet[0].contractId.practiceId
      };
      
      this.offerService.addRequestRevisionReason({ condition, updateDetails }).subscribe(
        data => {
          if (data.status === 200) {
            
            this.newTimesheet[0].timeClockStatus = environment.TIMESHEET_STATUS.REVISION;
            this.workDiaryService.addWork(this.newTimesheet[0]).subscribe(data => {
              if (data.status === 200) {
                this.getJobDetails();
                this.getOffers();
                this.getInvitations();
                this.getAllPositionTypes();
               
                this.reasonModal.hide();
                this.closeModel();
                //get offer and send notification
                const condition = {
                  _id: this.newTimesheet[0].contractId._id,                  
                };

                this.offerService.getOffer({condition}).subscribe(
                  data=>{
                    if(data.status ===200){
                      this.sendNotificationWithOffer('workDiaryUpdated',data.data);
                    }
                  }
                );
                
              }
            });
            
          }
        });
        
        
        
    }
  }

  closeModel() {
    this.offerJobModal.hide();
    this.declineJobModal.hide();
    this.messageModal.hide();
    this.reasonModal.hide();
    this.invitedListModal.hide();
    this.activatePracticeAccount.hide();
    this.cancelContractModal.hide();
  }

  sendOfferType() {
    const currntYear  = new Date().getFullYear();
    const currntMounth =  new Date().getMonth() + 1;

    if(this.cards.exp_year <= currntYear && currntMounth <= this.cards.exp_month){
      this.toastr.warning('We apologize for any inconvenience, but you are not permitted to send a counter offer at this time. Our records indicate that your credit card on file is about to expire. Please update your credit card information, in order to be able to submit your counteroffer. ', 'Warning' );
      return 0;
    }

    // retunr false;
    let message = '';
    this.spinner.show();
    if (this.currentoffer === this.offerType.RECOUNTER) {
      message = 'Counter offer has been sent.';
      this.offerDetails.offerSteps.recounter.message = this.sendOfferDetails.message;
      this.offerDetails.offerSteps.recounter.amount = this.sendOfferDetails.amount;
      this.offerDetails.offerSteps.recounter.startTime = this.sendOfferDetails.startTime;
      this.offerDetails.offerSteps.recounter.endTime = this.sendOfferDetails.endTime;
      // this.offerDetails.offerSteps.counter.offerTime =  new Date();
      // this.offerDetails.offerSteps.counter.offerBy =  this.userTypes.PRACTICE;
      // this.offerDetails.offerStatus = this.offerType.COUNTER;
      if (this.isDeleteOffer) {
        this.offerDetails.offerStatus = this.offerType.INITIAL;
        this.offerDetails.offerSteps.recounter.offerTime = '';
        this.offerDetails.offerSteps.recounter.offerBy = '';
      } else {
        // ---- For Notification
        if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] === this.userTypes.PRACTICE) {
          this.staffNotification['sentOffer'] = 1;
        } else {
          this.staffNotification['receivedOffer'] = 1;
        }
        this.offerDetails.offerSteps.recounter.offerTime = new Date();
        this.offerDetails.offerSteps.recounter.offerBy = this.userTypes.PRACTICE;
        this.offerDetails.offerStatus = this.offerType.RECOUNTER;
      }
    } else {
      // if (this.currentoffer === this.offerType.COUNTER) {
      message = 'Counter offer has been sent.';
      this.offerDetails.offerSteps.counter.message = this.sendOfferDetails.message;
      this.offerDetails.offerSteps.counter.amount = this.sendOfferDetails.amount;
      this.offerDetails.offerSteps.counter.startTime = this.sendOfferDetails.startTime;
      this.offerDetails.offerSteps.counter.endTime = this.sendOfferDetails.endTime;
      // this.offerDetails.offerSteps.counter.offerTime =  new Date();
      // this.offerDetails.offerSteps.counter.offerBy =  this.userTypes.PRACTICE;
      // this.offerDetails.offerStatus = this.offerType.COUNTER;
      if (this.isDeleteOffer) {
        this.offerDetails.offerStatus = this.offerType.INITIAL;
        this.offerDetails.offerSteps.counter.offerTime = '';
        this.offerDetails.offerSteps.counter.offerBy = '';
      } else {
        // ---- For Notification
        if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] === this.userTypes.STAFF) {
          this.staffNotification['sentOffer'] = 1;
        } else {
          this.staffNotification['receivedOffer'] = 1;
        }
        this.offerDetails.offerSteps.counter.offerTime = new Date();
        this.offerDetails.offerSteps.counter.offerBy = this.userTypes.PRACTICE;
        this.offerDetails.offerStatus = this.offerType.COUNTER;
      }
      // }
      //  else {
      //   message = 'Final Offer Send Succesfully.';
      //   this.offerDetails.offerSteps.final.message = this.sendOfferDetails.message;
      //   this.offerDetails.offerSteps.final.amount =  this.sendOfferDetails.amount;
      //   this.offerDetails.offerSteps.final.startTime =  this.sendOfferDetails.startTime;
      //   this.offerDetails.offerSteps.final.endTime =  this.sendOfferDetails.endTime;
      //   this.offerDetails.offerSteps.final.offerTime =  new Date();
      //   this.offerDetails.offerSteps.final.offerBy =  this.userTypes.PRACTICE;
      //   this.offerDetails.offerStatus = this.offerType.FINAL;
      // }
    }



    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.offerDetails = data.data;
          if (this.currentoffer === this.offerType.RECOUNTER) {
            this.invitationsList1[this.currentIndex] = this.offerDetails;
          } else {
            this.offersList1[this.currentIndex] = this.offerDetails;
          }
          if (this.isDeleteOffer) {
            this.deleteModal.hide();
            message = 'Offer has been deleted.';
            this.isDeleteOffer = false;
            // ----- delete Notification
            this.firebaseService.getAndDeleteNotification(
              this.offerDetails.practiceId._id, this.offerDetails.staffId._id,
              this.offerDetails._id, this.notificationType.counterOffer
            );
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', false);
          } else {
            // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
            this.sendNotification(this.currentoffer);
          }

          // if (this.currentoffer === this.offerType.COUNTER) {
          // this.common.incDecOfferCount(this.offerDetails.jobPostId, 'interviewOpen', true);
          // }
          // this.sendNotification(this.currentoffer);
          this.closeModel();
          this.resetOfferDetails()
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

  resetOfferDetails() {
    this.offerDetails = new Offer();
    this.currentoffer = '';
    this.currentIndex = -1;
  }

  // sendOffer() {
  //   // this.sendNotification();
  //   // return;
  //   this.offerDetails.bidSteps.initial.message = this.sendOfferDetails.message;
  //   this.offerDetails.bidSteps.initial.amount = this.sendOfferDetails.amount;
  //   this.offerDetails.offerType = environment.OFFER_STATUS.INITIAL;
  //   this.offerDetails.status = this.offerStatus.OFFER;
  //   this.offerDetails.practiceOfferTime = new Date();
  //   // if(this.isOffered) {
  //   // this.addOfferCountInJobs();
  //   // }
  //   this.offerService.addOffer(this.offerDetails).subscribe(
  //     data => {
  //       this.sendNotification('initialOffer');
  //       this.spinner.hide();
  //       this.closeModel();
  //       this.toastr.success(
  //         'Offer Send Succesfully.',
  //         'Success'
  //       );
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

  // addOfferCountInJobs() {
  //   this.jobDetail.offerCount++;
  //   this.jobsService.saveJob(this.jobDetail).subscribe(
  //     data => {
  //       // if (data.status === 200) {
  //       //   this.closeModel();
  //       //   this.spinner.hide();
  //       //     this.toastr.success(
  //       //       'Applied for Job succesfully.',
  //       //       'Success'
  //       //     );
  //       // }
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

  // sendNotification(type: String) {
  //   const name = this.currentUser.firstName + ' ' + this.currentUser.lastName;
  //   const jobTitle = this.offerDetails.jobPostId.jobTitle.toString();

  //   if (type === 'decline') {
  //     const message = environment.notificationMessage.declineBidPractice;
  //     const declinedMessage = this.declinedMessage.trim();
  //     this.notification.message = message.replace('#TITLE', jobTitle).replace('#NAME', name)
  //       .replace('#MESSAGE', declinedMessage);
  //     this.notification.redirectLink = environment.notificationLink.declineBidPractice + this.offerDetails.jobPostId._id;
  //   } else if (type === 'initial') {
  //     const message = environment.notificationMessage.initialOffer;
  //     this.notification.message = message.replace('#TITLE', jobTitle).replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.practiceOffer + this.offerDetails._id;
  //   } else if (type === 'final') {

  //     this.notification.message = environment.notificationMessage.sendMessage.replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.sendMessage + this.offerDetails.jobPostId._id;

  //   } else if (type === 'contract') {

  //     this.notification.message = environment.notificationMessage.bidAccept.replace('#TITLE', jobTitle).replace('#NAME', name);
  //     this.notification.redirectLink = environment.notificationLink.bidAccept + this.offerDetails.jobPostId._id;

  //   }

  //   this.notification.senderId = this.currentUser._id;
  //   this.notification.receiverId = this.offerDetails.staffId._id;
  //   // this.notification.createdAt = new Date();
  //   this.firebaseService.createNotification(this.notification);
  //   this.resetOfferDetails();
  // }

  timeValidation(type) {
    const otherType = (type === 'startTime') ? 'endTime' : 'startTime';
    const startTime = this.sendOfferDetails.startTime;
    const endTime = this.sendOfferDetails.endTime;
    if (endTime && startTime && (endTime !== startTime)) {
      if (startTime > endTime) {
        if (type === 'startTime') {
          this.sendOfferDetails[otherType] = this.sendOfferDetails[type];
        } else {
          setTimeout(() => {
            this.sendOfferDetails[type] = this.sendOfferDetails[otherType];
          }, 200);
        }
      }
    } else {
      this.sendOfferDetails[otherType] = this.sendOfferDetails[type];
    }
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
    let id = this.offerDetails._id;
    if(type == 'decline'){
      id = jobId;
    }
    let redirectLinkForStaff = notification[type].staffLink + id;
    if(type == 'recounter'){
      redirectLinkForStaff = notification[type].staffLink;
    }
    // const id = (checkType.indexOf(type) > -1) ? this.offerDetails._id : this.offerDetails.jobPostId._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.offerDetails.staffId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: redirectLinkForStaff,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
    this.staffNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
    this.resetOfferDetails();
  }

  sendNotificationWithOffer(type = '',offer) {
    if (!type) {
      return false;
    }
    // const checkType = ['accept'];
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(offer.jobPostId.jobTitle.toString());
    const jobId = offer.jobPostId._id;
    const message = this.declinedMessage.trim();
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = offer._id;
    let notificationCustomMessage;
    if(type == 'workDiaryUpdated'){
      notificationCustomMessage = 'Revision has been requested by <strong>#NAME</strong> for <strong>#TITLE</strong>'
      console.log('notification[type].staffLink + jobId', notification[type].staffLink + jobId)
    } else{
      notificationCustomMessage = notification[type].msg;
    }
    // const id = (checkType.indexOf(type) > -1) ? this.offerDetails._id : this.offerDetails.jobPostId._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: offer.staffId._id,
      message: notificationCustomMessage.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: notification[type].staffLink + offer._id,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: this.staffNotification,
      practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
    this.staffNotification = { sentOffer: 0, receivedOffer: 0, contract: 0 };
    this.resetOfferDetails();
  }

  declineOffer() {
    this.spinner.show();
    // ---- For Notification
    if (this.offerDetails.offerSteps[this.offerDetails.offerStatus]['offerBy'] === this.userTypes.STAFF) {
      this.staffNotification['sentOffer'] = 1;
    } else {
      this.staffNotification['receivedOffer'] = 1;
    }
    this.offerDetails.status = this.offerStatus.DECLINE;
    this.offerDetails.offerDecline = {
      declineTime: new Date(),
      reason: this.declinedMessage,
      declineBy: this.userTypes.PRACTICE
    };
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.staffId._id,
            this.jobDetail._id);
          this.offersList[this.currentIndex] = this.offerDetails;
          this.offersList1[this.currentIndex] = this.offerDetails;
          this.invitationsList1[this.currentIndex] = this.offerDetails;
          this.sendNotification('decline');
          this.closeModel();
          this.toastr.success(
            'Application was declined.',
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

  sendMessageToStaff() {
    this.spinner.show();
    const userMessageRecipient = {
      created_at: new Date().getTime(),
      group: {
        group_id: 53,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQEYoP0Qy_MnbnHVhnBDrQFarbKj6qDJj0FuI7pyOHL2V1Y-5_E&usqp=CAU',
        image_id: 1311,
        title: 'Looking Job for Dental Practice'
      },
      is_attachment: false,
      item: {
        item_id: 53,
        module: 'common\\models\\UserService'
      },
      message: {
        created_at: new Date().getTime(),
        is_attachment: false,
        recipients: {
          [this.offerDetails.staffId._id]: {
            id: this.offerDetails.staffId._id,
            status: 'unread',
            unread: 0
          },
          [this.currentUser._id]: {
            id: this.currentUser._id,
            status: 'read',
            unread: 0
          }
        },
        sender: this.currentUser._id,
        text: (this.sendMessage) ? this.sendMessage : 'Let\'s Start Chat on Densub!',
        updated_at: new Date().getTime()
      },
      recipients: {
        [this.offerDetails.staffId._id]: {
          avatar: (this.offerDetails.staffId['profilePhoto'].length) ? this.offerDetails.staffId['profilePhoto'][0] : '',
          fullName: this.offerDetails.staffId.firstName + ' ' + this.offerDetails.staffId.lastName,
          id: this.offerDetails.staffId._id,
          status: 'unread',
          unread: 0
        },
        [this.currentUser._id]: {
          avatar: (this.currentUser['profilePhoto'].length) ? this.currentUser['profilePhoto'][0] : '',
          fullName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
          id: this.currentUser._id,
          status: 'read',
          unread: 0
        }
      },
      updated_at: new Date().getTime()
    };

    const userMessage = {
      created_at: new Date().getTime(),
      is_attachment: false,
      recipients: {
        [this.offerDetails.staffId._id]: {
          id: this.offerDetails.staffId._id,
          status: 'unread'
        },
        [this.currentUser._id]: {
          id: this.currentUser._id,
          status: 'read'
        }
      },
      sender: this.currentUser._id,
      text: (this.sendMessage) ? this.sendMessage : 'Let\'s Start Chat on Densub!',
      updated_at: new Date().getTime()
    };

    const postData = {
      userMessageRecipient: userMessageRecipient,
      userMessage: userMessage
    };
    this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
    this.toastr.success(
      'Message has been sent.',
      'Success'
    );
    this.resetOfferDetails();
    this.closeModel();
    this.spinner.hide();
  }

  // activeOffer(offerDetails, type = '') {
  //   this.offerDetails = offerDetails;
  //   this.spinner.show();
  //   this.offerDetails.status = this.offerStatus.CONTRACT;
  //   this.offerDetails.contractStartTime = new Date();
  //   this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
  //   this.offerDetails['finalRate'] = this.offerDetails.bidSteps[this.offerDetails.offerType].amount;
  //   this.offerService.addOffer(this.offerDetails).subscribe(
  //     data => {
  //       if (data.status === 200) {
  //         const bidIndex = this.bidsList.indexOf(function (bid) {
  //           return bid._id === offerDetails._id;
  //         });
  //         if (bidIndex !== -1) {
  //           this.bidsList[bidIndex] = this.offerDetails;
  //         }
  //         if (type === 'close') {
  //           this.closeJob();
  //         }
  //         this.sendNotification('contract');
  //         this.spinner.hide();
  //         this.toastr.success(
  //           'Offer has been accepted.',
  //           'Success'
  //         );
  //       } else {
  //           this.spinner.hide();
  //           this.toastr.error(
  //           'There are some server Please check connection.',
  //           'Error'
  //           );
  //         }
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

  acceptOffer(offerDetails, index) {
    this.currentIndex = index;
    this.currentContractDetails = offerDetails;
    this.comissionAmount = offerDetails.offerSteps[offerDetails.offerStatus].amount;
    this.methodFlag = 'acceptOfferWithPayment';
    this.stripeModal.show();
    this.staffName = offerDetails.staffId.firstName +' '+ offerDetails.staffId.lastName; 
    return 0;
    this.spinner.show();
    this.offerDetails = offerDetails;
    this.offerDetails.status = this.offerStatus.CONTRACT;
    this.offerDetails.contractStartTime = new Date();
    this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
    this.offerDetails['finalRate'] = offerDetails.offerSteps[offerDetails.offerStatus].amount;
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          const newJob = {
            _id: this.offerDetails.jobPostId._id,
            status: environment.JOB_STATUS.FILLED
          };
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          this.changeJobStatus(newJob);
          this.offersList = this.offersList1.map((value, i) => {
            if (index == i) {
              return offerDetails;
            } else {
              value.status = this.offerStatus.DECLINE;
              return value;
            }
          });
          //  this.offersList[index] = offerDetails;
          this.declinedOfferList(offerDetails);
          // if (type === 'close') {
          //   this.closeJob();
          // }
          setTimeout(() => {
            this.router.navigate(['practice/contracts/details', data.data._id]);
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

  acceptOfferWithPayment(offerDetails, index) {
    this.staffName = offerDetails.staffId.firstName +' '+ offerDetails.staffId.lastName; 
    this.spinner.show();
    this.offerDetails = offerDetails;
    this.offerDetails.status = this.offerStatus.CONTRACT;
    this.offerDetails.contractStartTime = new Date();
    this.offerDetails['contractStatus'] = environment.CONTRACT_STATUS.UPCOMING;
    this.offerDetails['finalRate'] = offerDetails.offerSteps[offerDetails.offerStatus].amount;
    this.offerService.addOffer(this.offerDetails).subscribe(
      data => {
        if (data.status === 200) {
          let tempJObStatus = environment.JOB_STATUS.FILLED;
          const todaysDate = new Date();
          const offerDate = new Date(this.offerDetails.offerSteps[offerDetails.offerStatus].startTime);
          if(todaysDate.getFullYear() === offerDate.getFullYear() && todaysDate.getMonth() === offerDate.getMonth() && todaysDate.getDate() === offerDate.getDate() ){
            tempJObStatus= environment.JOB_STATUS.INPROGRESS
          }
          const newJob = {
            _id: this.offerDetails.jobPostId._id,
            status: tempJObStatus,
            isPyament: true,
            paymentId: this.offerDetails.paymentId,
          };
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          this.changeJobStatus(newJob);
          this.offersList = this.offersList1.map((value, i) => {
            if (index == i) {
              return offerDetails;
            } else {
              value.status = this.offerStatus.DECLINE;
              return value;
            }
          });
          //  this.offersList[index] = offerDetails;
          this.declinedOfferList(offerDetails);
          // if (type === 'close') {
          //   this.closeJob();
          // }
          setTimeout(() => {
            // this.selectedJobTab = 1;
            //location.reload();
            //reset all the things 

            this.getJobDetails();
            this.getOffers();
            this.getInvitations();
            this.getAllPositionTypes();
            this.todaysDate = new Date();
            //this.selectedWork.offlinePyamentType = environment.OFFLINE_PAYMENT_TYPE.INPERSON;
            this.selectedWork.paymentDetails.paymentType = environment.WORKDIARY_PAYMENT_TYPE.ONLINE;

           // this.router.navigate(['practice/contracts/details', data.data._id]);
          }, 1000);
        } else {
          this.toastr.error(
            'There are some server Please check connection.',
            'Error'
          );
        }
        //this.spinner.hide();
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
  acceptOfferByPractice(offerDetails, index) {
    this.currentIndex = index;
    this.currentContractDetails = offerDetails;
    this.comissionAmount = offerDetails.offerSteps[offerDetails.offerStatus].amount;
    this.methodFlag == 'acceptOfferByPracticeWithPayment';
    this.stripeModal.show();
    this.staffName = offerDetails.staffId.firstName +' '+ offerDetails.staffId.lastName; 
    return 0;

  }

  acceptOfferByPracticeWithPayment(offerDetails, index) {
    this.staffName = offerDetails.staffId.firstName +' '+ offerDetails.staffId.lastName; 
    this.spinner.show();
    this.offerDetails = offerDetails;
    const updateDetails = {
      status: this.offerStatus.CONTRACT,
      contractStatus: offerDetails.jobPostId.jobType === this.jobTypes.TEMPORARY ?  environment.CONTRACT_STATUS.UPCOMING : environment.CONTRACT_STATUS.COMPLETED,
      finalRate  : offerDetails.offerSteps[offerDetails.offerStatus].amount,
      contractStartTime: new Date()
    };
    const condition = {
      _id: offerDetails._id,
      jobPostId: offerDetails.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          let tempJObStatus ;
          if(this.offerDetails.jobPostId.jobType === this.jobTypes.TEMPORARY){
            tempJObStatus = environment.JOB_STATUS.FILLED;
          }else{
             tempJObStatus = environment.JOB_STATUS.COMPLETED;
          }
          const todaysDate = new Date();
          const offerDate = new Date(this.offerDetails.offerSteps[offerDetails.offerStatus].startTime);
          if(todaysDate.getFullYear() === offerDate.getFullYear() && todaysDate.getMonth() === offerDate.getMonth() && todaysDate.getDate() === offerDate.getDate() ){
            tempJObStatus= environment.JOB_STATUS.INPROGRESS
          }
          const newJob = {
            _id: this.offerDetails.jobPostId._id,
            status: tempJObStatus
          };
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          this.changeJobStatus(newJob);

          this.offersList = this.offersList1.map((value, i) => {
            if (index == i) {
              return offerDetails;
            } else {
              value.status = this.offerStatus.DECLINE;
              return value;
            }
          });
          //  this.offersList[index] = offerDetails;
          this.declinedOfferList(offerDetails);


          // this.staffNotification['contract'] = 1;
          // this.sendNotification('accept');
          // this.toastr.success('Offer has been accepted.', 'Success');
          setTimeout(() => {
            // this.selectedJobTab = 1;
            //location.reload();
            //rest all the things
            this.getJobDetails();
            this.getOffers();
            this.getInvitations();
            this.getAllPositionTypes();
            this.todaysDate = new Date();
            this.selectedWork.offlinePyamentType = environment.OFFLINE_PAYMENT_TYPE.INPERSON;

            //this.router.navigate(['practice/contracts/details', offerDetails._id]);
          }, 1000);

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

  createRecipents() {
    const userMessageRecipient = this.firebaseService.createUserMessageRecipientModal(this.jobDetail._id, this.jobDetail.jobTitle, this.currentUser, this.currentContractDetails.staffId);
    const userMessage = this.firebaseService.createUserMessageModal(this.currentUser, this.currentContractDetails.staffId);
    const postData = {
      userMessageRecipient: userMessageRecipient,
      userMessage: userMessage
    };
    this.firebaseService.InsertUserMessageRecipient(postData); // Submit data
  }

  declinedOfferList(offerDetails) {
    const condition = {
      _id: { $ne: offerDetails._id },
      jobPostId: offerDetails.jobPostId._id,
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT },
        { status: this.offerStatus.APPLYED }
      ],
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data.length > 0) {
            this.declineStaffList = data.data;
          }
          this.declineOtherOffers(offerDetails);
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

  declineOtherOffers(offerDetails) {
    const offerDecline = {
      reason: 'Due to the job was filled',
      declineTime: moment().toISOString(),
      declineBy: environment.USER_TYPE.PRACTICE,
    };
    const updateDetails = {
      status: this.offerStatus.DECLINE,
      offerDecline: offerDecline
    };
    const condition = {
      _id: { $ne: offerDetails._id },
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT },
        { status: this.offerStatus.APPLYED },
      ],
      jobPostId: offerDetails.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('autodecline', offerDecline.reason);
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
    this.declineStaffList.map(value => {
      let redirectL = '';
      const title = value.jobPostId.jobTitle.toString();
      const jobId = value.jobPostId._id;
      const menuCount = (value.sendOfferByPractice) ? ({ sentOffer: 0, receivedOffer: 1, contract: 0 }) :
        ({ sentOffer: 1, receivedOffer: 0, contract: 0 });
      const id = value.jobPostId._id;
      if(type === 'autodecline'){
          redirectL = notification[type].staffLink;
      }else{
        redirectL = notification[type].staffLink + id;
      }
      this.notification = {
        senderId: this.currentUser._id,
        receiverId: value.staffId._id,
        message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
        redirectLink: redirectL,
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

  removedChangeJobStatus() {
    this.staffNotification['contract'] = 1;
    this.sendNotification('accept');
    this.toastr.success('Application has been accepted.', 'Success');
  }

  changeJobStatus(newJob) {
    this.jobsService.saveJob(newJob).subscribe(
      data => {
        if (data.status === 200) {
          this.staffNotification['contract'] = 1;
          if(this.offerDetails.jobPostId.jobType === this.jobTypes.TEMPORARY){
            this.sendNotification('acceptByPractice');
          }else{
            this.sendNotification('acceptAndHiredByPractice');
          }
          this.createRecipents();
          this.toastr.success('Application has been accepted.', 'Success');
          // this.selectedJobTab = 1;
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

  // closeJob() {
  //   const newJob = {
  //     _id: this.offerDetails.jobPostId._id,
  //     status: environment.JOB_STATUS.CLOSED
  //   };
  //   this.jobsService.saveJob(newJob).subscribe(
  //     data => {
  //       if (data.status === 200) {
  //         this.toastr.success('Job closed successfully.', 'Success');

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

  opendeleteModal(index, offerDetails) {
    this.deleteModalMessage = {
      heading: 'Delete Offer',
      message: 'Are you sure want to delete send offer?',
      type: 'offer'
    };
    this.currentIndex = index;
    this.deleteModal.show();
    this.offerDetails = offerDetails;
  }

  deleteOffer() {
    this.spinner.show();
    if (this.offerDetails.offerStatus === this.offerType.INITIAL) {
      this.offerService.deleteOffer({ _id: this.offerDetails }).subscribe(data => {
        if (data.status === 200) {
          this.spinner.hide();
          //--- DeleteMessageRecipents ----
          this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.offerDetails.staffId._id,
            this.jobDetail._id, 'delete');
          // ----- delete Notification
          this.firebaseService.getAndDeleteNotification(
            this.offerDetails.practiceId._id, this.offerDetails.staffId._id,
            this.offerDetails._id, this.notificationType.initialOffer
          );
          this.common.incDecJobCount(this.jobDetail, 'sentStaffOffers', false);
          this.offersList[this.currentIndex] = this.offerDetails;
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
      this.sendOfferDetails = {
        amount: 0,
        message: '',
        startTime: '',
        endTime: ''
      };
      this.sendOfferType();

    }
  }

  showDeletejobModal() {
    if (this.jobStatus.CONTRACT === this.jobDetail.status || this.jobStatus.COMPLETED === this.jobDetail.status) {
      this.isDeleteWarningModal = true;
      this.editJobModal.show();
      return false;
    } else {
      this.isDeleteWarningModal = false;
      this.deleteModalMessage = {
        heading: 'Delete Job',
        message: 'Are you sure you want to delete this Job ?',
        type: 'job'
      };
      this.deleteModal.show();
      return false;
    }
  }

  /*     showDeletejobModal() {
        if (this.jobStatus.CONTRACT === this.jobDetail.status || this.jobStatus.COMPLETED === this.jobDetail.status) {
          this.isDeleteWarningModal = true;
          this.editJobModal.show();
          return false;
        }
        this.checkJobOffer('delete');
      } */

  /* deleteJob() {
    this.spinner.show();
    this.jobsService.deleteJob({ _id: this.jobDetail._id }).subscribe(
      data => {
        this.spinner.hide();
        this.deleteModal.hide();
        if (data.status === 200) {
          this.router.navigate(['practice/job-posts']);
          this.toastr.success(
            'Job has been deleted.',
            'Success'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.deleteModal.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  } */

  /*     deleteJobOffers(jobId) {
        // const updateDetails =  {
        //     status: environment.OFFER_STATUS_NEW.DELETED,
        //   };
        const condition = {
          jobPostId: jobId
        };
        // this.offerService.updateMultipleOffer({condition , updateDetails })
        this.offerService.deleteAllOffer(condition).subscribe(
          data => {
            if (data.status === 200) {
              this.toastr.success('Job has been deleted.', 'Success');
              this.router.navigate(['practice/job-posts']);
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
          });
      } */

  deleteJobOffers() {
    this.spinner.show();
    this.deleteModal.hide();
    const condition = {
      jobPostId: this.jobDetail._id
    };
    this.offerService.getAllOffers({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          const self = this;
          data.data.map(offer => {
            self.common.sendOfferDeleteNotification(
              'deleteOffer',
              offer.staffId._id,
              offer.jobPostId.jobTitle,
              offer.jobPostId._id,
              offer._id
            );
            self.firebaseService.deleteMessageCon(self.currentUser._id, offer.jobPostId._id);
          });
          this.deleteAllOffers(this.jobDetail._id);
          this.deleteJob();
          // this.toastr.success('Job has been deleted.', 'Success');
          // this.spinner.hide();
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
      });
  }

  deleteJob() {
    const deleteJob = {
      _id: this.jobDetail._id,
      // status: this.jobStatus.DELETED
    };
    //  this.jobsService.saveJob(deleteJob)
    this.jobsService.deleteJob(deleteJob).subscribe(
      data => {
        if (data.status === 200) {
          this.common.removeFavorite(this.jobDetail._id);
          // this.firebaseService.getJobAndDeleteNotification(this.jobDetail._id);
          // this.deleteOffers(this.jobDetail._id);
          // this.deleteJobOffers(this.jobDetail._id);
        }
        this.newJob = new JobNewPost();
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

  deleteAllOffers(jobId) {
    const condition = {
      jobPostId: jobId
    };
    this.offerService.deleteAllOffer(condition).subscribe(
      data => {
        if (data.status === 200) {
          this.toastr.success('Job has been deleted.', 'Success');
          this.router.navigate(['practice/job-posts']);
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
      });
  }

  editJob() {
    const total = this.jobDetail.total.sentStaffOffers + this.jobDetail.total.sentPracticeOffers;
    if (this.jobStatus.CONTRACT === this.jobDetail.status ||
      this.jobStatus.COMPLETED === this.jobDetail.status ||
      this.jobStatus.CANCELLED === this.jobDetail.status ||
      (
        (this.jobStatus.OPEN === this.jobDetail.status ||
          this.jobStatus.CLOSED === this.jobDetail.status)
        && total > 0)
    ) {
      this.isDeleteWarningModal = false;
      this.editJobModal.show();
      return false;
    } else {
      this.openJobModal();
    }
    //  this.checkJobOffer('edit');
  }

  getInporgressStatus(jobDate) {
    const endofToday = moment().endOf('day');
    return moment(jobDate).isBefore(endofToday);
  }

  checkJobOffer(type) {
    this.spinner.show();
    const condition = {
      jobPostId: this.jobDetail._id,
      status: { $in: [environment.OFFER_STATUS_NEW.OFFER] },
    };
    /* , environment.OFFER_STATUS_NEW.DECLINE, environment.OFFER_STATUS_NEW.REVOKE */
    this.offerService.getTotal({ condition }).subscribe((data) => {
      if (data.status === 200) {
        this.spinner.hide();
        if (type === 'delete') {
          if (data.data === 0) {
            this.isDeleteWarningModal = false;
            this.deleteModalMessage = {
              heading: 'Delete Job',
              message: 'Are you sure you want to delete this Job ?',
              type: 'job'
            };
            this.deleteModal.show();
            return false;
          } else {
            this.isDeleteWarningModal = true;
            this.editJobModal.show();
            return false;
          }
        }
        if (type === 'edit') {
          if (data.data === 0) {
            this.openJobModal();
          } else {
            this.isDeleteWarningModal = false;
            this.editJobModal.show();
            return false;
          }
        }
      } else {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    },
      (error) => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server Please check connection.',
          'Error'
        );
      }
    );
  }

  openJobModal() {
    const modalRef = this.ngBoostrapModalService.open(
      AddEditPostComponent,
      { centered: true, backdrop: true, keyboard: true },
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(this.jobDetail), '/practice/job-posts', this.jobDetail.jobType);
    }, 200);
  }

  createRepostJobArray() {
    let jobDetails = { ...this.jobDetail };
    jobDetails['jobDates'] = [];
    // delete jobDetails._id;
    jobDetails.status = (new JobNewPost).status;
    jobDetails.visibility = (new JobNewPost).visibility;
    jobDetails.total = (new JobNewPost).total;
    // jobDetails.visibility = (new JobNewPost).expireDate;
    // jobDetails.offerCount = (new JobNewPost).offerCount;
    // jobDetails.createdBy = (new JobNewPost).createdBy;
    if (jobDetails.createdAt) {
      delete jobDetails.createdAt;
    }
    if (jobDetails.updatedAt) {
      delete jobDetails.updatedAt;
    }
    if (jobDetails.contractId) {
      delete jobDetails.contractId;
    }
    if (jobDetails.createdBy) {
      delete jobDetails.createdBy;
    }
    // jobDetails['declineStaffList'] = this.declineStaffList;
    const jobDate = moment(jobDetails.jobDate).endOf('d');
    if (moment().isAfter(jobDate)) {
      jobDetails.jobDate = '';
    }
    if (jobDetails.expireDate && moment().isSameOrAfter(jobDetails.expireDate)) {
      jobDetails.expireDate = (new JobNewPost).expireDate;
      jobDetails.paymentId = (new JobNewPost).paymentId;
      jobDetails.activeMonthRate = (new JobNewPost).activeMonthRate;
      // jobDetails.status = environment.JOB_STATUS.EXPIRED;
    }
    jobDetails['repostJob'] = true;
    return jobDetails;
  }

  repostJob() {
    const jobDetails = this.createRepostJobArray();
    //  return false;
    const modalRef = this.ngBoostrapModalService.open(
      AddEditPostComponent,
      { centered: true, backdrop: true, keyboard: true },
    );
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
    });
    setTimeout(() => {
      modalRef.componentInstance.setData(JSON.stringify(jobDetails),
        '/practice/job-details/' + this.jobDetail._id,
        this.jobDetail.jobType);
    }, 200);
  }

  tempStr: any = '';
  onEditorChange() {
    this.tempStr = this.sendOfferDetails.message;
    if ((this.tempStr === null) || (this.tempStr === '')) {
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      return false;
    } else {
      this.tempStr = this.tempStr.toString();
      this.tempStr = this.tempStr.replace(/(<([^>]+)>)/ig, '');
      this.tempStr = this.tempStr.replace('&nbsp;', '');
      if (this.tempStr.length > 1000) {
        this.toastr.warning('You can not enter more then 1000 characters.', 'Warning');
        this.tempStr = this.tempStr.slice(0, 1000);
        this.sendOfferDetails.message = this.tempStr;
        return false;
      }
    }
  }

  selectATab(tabValue: string) {
    if(tabValue == '3'){
      if(!this.timesheetNotSubmitted){
      this.openPaymentModal('timesheet',this.newTimesheet[0],0);
      this.assignContractDetails();
      if(this.checkSign){
        this.checkSign = true;
      } else{
        this.checkSign = false;
      } 
  }
    }
    if (tabValue == this.jobTabsNew[0]._id) {
      //this.dataFilter.changedJobStatus = 'open';
    } else if (tabValue == this.jobTabsNew[1]._id) {
      //this.dataFilter.changedJobStatus = 'expired';
    } else if (tabValue == this.jobTabsNew[2]._id) {
      //this.dataFilter.changedJobStatus = '';
      this.changeTimeSheetStatus();
    } else if (tabValue == this.jobTabsNew[3]._id) {      
      //this.dataFilter.changedJobStatus = '';
    } else if (tabValue == this.jobTabsNew[4]._id) {
      //this.dataFilter.changedJobStatus = '';
    }

    this.selectedJobTab = tabValue;
  }

  changeTimeSheetStatus(){  
    if(this.newTimesheet.length>0){
      if(this.newTimesheet[0].timeClockStatus == environment.TIMESHEET_STATUS.SPA){
        const updateDetails = {
          isContractRead : true,
        }
        const condition = {
          _id: this.newTimesheet[0].contractId,           
          practiceId: this.newTimesheet[0].contractId.practiceId._id
        };
        
        this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
          data => {
            if (data.status === 200) {
              console.log('Offer updated Successfully');
            }
          });
      }
    }
  
  }
  showChangedJobTitle(title = '') {
    if (title === 'cancelledByStaff') {
      return 'Cancelled By Staff';
    }
    if (title === 'cancelledByPractice') {
      return 'Cancelled By Practice';
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
    //return title;
  }

  getStatus(currentOffer) {
    if (currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Declined</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
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
  getStatusForApplication(currentOffer) {
    if (currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Declined</span>';
    } else if(currentOffer.finalRate != undefined && currentOffer.finalRate > -1){
      return '<span class="badge badge-primary">Hired</span>';
    }else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-primary">Applied</span>';
    }else if(currentOffer.contractStatus == 'cancelled'){
      const result = currentOffer.cancelContract.cancelBy =='staff' ? 'Cancelled By Staff':' Cancelled By Practice'
      return '<span class="badge badge-danger">'+ result +'</span>';
    } else {
      if(currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && (currentOffer.status === environment.OFFER_STATUS_NEW.APPLYED || currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT )){
        return '<span class="badge badge-primary">Applied</span>';
      }
      if ((currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER || currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) &&  currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT) {
        return '<span class="badge badge-primary">Counter offer received</span>';
      }
      if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        return '<span class="badge badge-primary">Applied</span>';
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary"><span class="fa fa-exchange mr-2 clr-orange"></span>Counter offer received</span>';
      }else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
        return '<span class="badge badge-primary"><span class="fa fa-exchange mr-2 clr-orange"></span>Final Offer Sent</span>';
      }
       else {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      }
    }
  }
  getInvitedStatus(currentOffer) {
    if (currentOffer.staffId.readStatus.status === 'unread' && currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-primary">Not Viewed</span>';
    } else if (currentOffer.staffId.readStatus.status === 'read' && currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span class="badge badge-success">Viewed</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT) {
      return '<span class="badge badge-primary">Hired</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT) {
      return '<span class="badge badge-primary">Invited Application Accepted</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.EXPIRED) {
      return '<span class="badge badge-secondary">Expired</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Invitation Is Declined</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      let declineByName = '';
      if (currentOffer.offerDecline.declineBy === environment.USER_TYPE.STAFF) {
        declineByName = environment.NEW_USERS_NAME.STAFF;
      } else {
        declineByName = environment.NEW_USERS_NAME.PRACTICE;
      }
      return '<span class="badge badge-danger">Declined by ' + declineByName + '</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      let declineByName = '';
      if (currentOffer.offerDecline.declineBy === environment.USER_TYPE.STAFF) {
        declineByName = environment.NEW_USERS_NAME.STAFF;
      } else {
        declineByName = environment.NEW_USERS_NAME.PRACTICE;
      }
      return '<span class="badge badge-danger">Declined by ' + declineByName + '</span>';
    } else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE) {
      return '<span class="badge badge-danger">Invitation Is Declined</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.OFFER && currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
      return '<span class="badge badge-success">Awaiting Response to your counter offer</span>';
    } else if (currentOffer.status === environment.OFFER_STATUS_NEW.CONTRACT && currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER) {
      return '<span class="badge badge-success">Hired</span>';
    } else {
      if (currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL) {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      } else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER) {
        return '<span class="badge badge-primary"><span class="fa fa-exchange clr-orange mr-2"></span>Counter Offer Received</span>';
      } else {
        return '<span class="badge badge-warning">Waiting for Approval</span>';
      }
    }
  }

  showCancelContractModal(offer) {
    this.contractDetail = offer;
    this.isContractRevoke = true;
    this.cancelContractModal.show();
  }
  isRated: any = {
    practice: false,
    staff: false,
  };
  ratedDetails = {
    practice: new Rating(),
    staff: new Rating()
  };
  ratingDetail: any = new Rating();
  getRating() {
    const condition = {
      staffId: { $eq: this.contractDetail.staffId._id },
      practiceId: { $eq: this.currentUser._id },
      contractId: { $eq: this.contractDetail._id },
    }
    this.ratingService.getRatings({ condition: condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length) {
          const self = this;
          const ratedList = data.data;
          ratedList.map(value => {
            if (environment.USER_TYPE.PRACTICE === value.ratedBy) {
              if (value.status === environment.RATING_STATUS.DONE) {
                self.isRated.staff = true;
                this.rateFlag = false;
                self.ratedDetails.staff = value;
              } else {
                self.ratingDetail = value;
                // self.ratedDetails.practice = value;
              }
            }
            if ((value.status === environment.RATING_STATUS.DONE) && (environment.USER_TYPE.STAFF === value.ratedBy)) {
              self.isRated.practice = true;
              self.ratedDetails.practice = value;
            }
          });
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

  addRatingToStaffProfile() {
    var updateDetails = {
      _id: this.contractDetail.staffId._id,
    }
    updateDetails['avgRating'] = (this.contractDetail.staffId.avgRating && this.contractDetail.staffId.avgRating > 0)
      ? ((this.ratingDetail.rating + this.contractDetail.staffId.avgRating) / 2).toFixed(1)
      : this.ratingDetail.rating;

    this.usersService.saveUserData(updateDetails).subscribe(
      data => {
        if (data.status === 200) {
          // if(this.isRated.job) {
          //   this.sendNotification('rating');
          // }
        } else {
          this.toastr.error(
            'There are some server error please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    );
  }


  submitRating(isRateLater: Boolean) {
    this.spinner.show();
    if(this.contractDetail._id === undefined){
      this.contractDetail = this.currentContractDetails;
    }
    this.ratingDetail.staffId = this.contractDetail.staffId._id;
    this.ratingDetail.practiceId = this.currentUser._id;
    this.ratingDetail.contractId = this.contractDetail._id;
    this.ratingDetail.ratedBy = environment.USER_TYPE.PRACTICE;
    if (isRateLater) {
      this.ratingDetail.status = environment.RATING_STATUS.PENDING;
      this.isRated.staff = false;
      this.rateFlag = true;
    } else {
      this.rateFlag = false;
      this.isRated.staff = true;
      this.ratingDetail.status = environment.RATING_STATUS.DONE;
      this.ratedDetails.staff = this.ratingDetail;
      this.addRatingToStaffProfile();
    }
    this.ratingService.saveRating(this.ratingDetail).subscribe(data => {
      if (data.status === 200) {
        this.endContractModal.hide();
        this.spinner.hide();
        // -------   Update End Job Status ------------
        // if (this.contractDetail.contractStatus !== environment.CONTRACT_STATUS.COMPLETED) {
        //   this.contractDetail['endContract'] = {
        //     endTime: new Date(),
        //     endBy: environment.USER_TYPE.STAFF
        //   };
        //   this.contractDetail.contractStatus = environment.CONTRACT_STATUS.COMPLETED;
        //   this.contractDetail.jobPostId.status = environment.JOB_STATUS.COMPLETED;
        //   this.updateOfferStatus('Contract has ended.', 'endContract');
        //   const jobData = {
        //     _id: this.contractDetail.jobPostId._id,
        //     status: this.contractDetail.jobPostId.status
        //   };
        //   this.updateJobDetails(jobData);
        // } else 
        if (this.isRated.staff) {
          // ---- When contract is already end by Practice
          this.toastr.success(
            'Rating has been submitted.',
            'Success'
          );
        }
        // -------   Update End Job Status ------------
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


  getContract(contractId) {
    this.spinner.show();
    const condition = {
      jobPostId: contractId,
      status: this.offerStatus.CONTRACT
    };
    this.offerService.getOffer({ condition }).subscribe(
      data => {
        if (data.status === 200) {
          if (data.data) {
            this.contractDetail = data.data;
            this.checkAndUpdateNotification();
            this.contractDetail['duration'] = this.getContractDuration();
            this.getCommissionAmount();
            this.getTimesheet();
            this.getRating();
            // this.declinedContractList();
          } else {
           // this.router.navigate(['practice/contracts']);
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
  jobType = environment.JOB_TYPE;
  getContractDuration() {
    const diffTime = differenceInHours(this.contractDetail.jobPostId.endTime, this.contractDetail.jobPostId.startTime);
    if (this.jobType.TEMPORARY !== this.contractDetail.jobPostId.jobType) {
      const selectedDays = this.contractDetail.jobPostId.availableDays.filter((day) => {
        return day.available;
      });
      return diffTime * selectedDays.length;
    } else {
      return diffTime;
    }
  }
  checkAndUpdateNotification() {
    const senderId = this.contractDetail.staffId._id;
    const receiverId = this.contractDetail.practiceId._id;
    const offerId = this.contractDetail._id;
    const status = environment.notificationStatus.UNREAD;
    this.firebaseService.getAndUpdateNotification(senderId, receiverId, offerId, status);
  }
  cancelContract() {
    this.cancelContractDetail.cancelTime = new Date();
    this.cancelContractDetail.cancelBy = environment.USER_TYPE.PRACTICE;
    this.contractDetail['cancelContract'] = this.cancelContractDetail;
    this.contractDetail.contractStatus = environment.CONTRACT_STATUS.CANCELLED;

    if (this.isContractRevoke) {
      this.contractDetail.contractStatus = environment.CONTRACT_STATUS.REVOKE;
    }
    this.firebaseService.updateStatusInFBDB(this.currentUser._id, this.contractDetail.staffId._id,
      this.contractDetail.jobPostId._id);
    // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', false);
    this.updateOfferStatus('Contract has been cancelled.', 'cancelContract');
    this.updateCalendar(environment.CALENDAR_STATUS.AVAILABLE);
    if (!this.isContractRevoke) {
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.CANCELLED;
      const jobData = {
        _id: this.contractDetail.jobPostId._id,
        status: environment.JOB_STATUS.CANCELLED
      };
      this.updateJobDetails(jobData);
    }
    this.closeModel();
  }

  showCancelContract(offer){
    this.contractDetail = offer;
    this.cancelContractModal.show()
  }
  updateOfferStatus(message: string, type?: String) {
    this.offerService.addOffer(this.contractDetail).subscribe(
      data => {
        this.spinner.hide();
        //this.stripeModal.hide();
        if (data.status === 200) {
          if (type === 'activateContract') {
            this.sendNotificationForCancelContract('activateContract');
          } else if (type === 'cancelContract') {
            this.sendNotificationForCancelContract('cancelContract');
          } else if (type === 'endContract') {
            this.sendNotificationForCancelContract('endContract');
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

  updateCalendar(status) {
    let whereObj = {
      jobDate: this.contractDetail.jobPostId.jobDate,
      staffId: this.contractDetail.staffId._id,
      status: status
    }
    this.usersService.updateCalendar(whereObj).subscribe(
      data => {
        if (data.status === 200) { } else {
          this.toastr.error(
            'There are some server error please check connection.',
            'Error'
          );
        }
      },
      error => {
        this.spinner.hide();
        this.toastr.error(
          'There are some server error please check connection.',
          'Error'
        );
      }
    );
  }

  updateJobDetails(jobData) {
    this.jobsService.saveJob(jobData).subscribe(
      data => {
        if (data.status === 200) {
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

  sendNotificationForCancelContract(type = '') {
    if (!type) {
      return false;
    }
    const checkType = ['rating'];
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.contractDetail.jobPostId.jobTitle.toString());
    const jobId = this.contractDetail.jobPostId._id;
    const message = this.cancelContractDetail.reason;
    const currentTime = new Date().getTime();
    const notification = environment.notification;
    const id = (checkType.indexOf(type) > -1) ? this.contractDetail.staffId._id : this.contractDetail._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.contractDetail.staffId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#MESSAGE', message),
      redirectLink: notification[type].staffLink + id,
      type: notification[type].type,
      offerId: id,
      jobId: jobId,
      staff: { sentOffer: 0, receivedOffer: 0, contract: 1 },
      practice: { sentOffer: 0, receivedOffer: 0, contract: 0 },
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }
  //Stripe payment gatway

  stripTest() {  
    this.stripeSource.createSource();
  }
  stripTest1(){
    console.log('in test one ');
    this.methodFlag ='acceptOfferByPracticeWithPayment';
    this.stripTest();
  }


  // addPaymentDetails() {
  //   this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(async data => {
  //     if (data.status === 200) {
  //       // if (this.timeSheetPayment) {
  //       //   this.selectedWork.paymentDetails['paymentId'] = data.data._id;
  //       //   this.submitWorkDiary();
  //       // } else {
  //         this.contractDetail['paymentId'] = data.data._id;
  //         this.contractDetail.contractStatus = this.contractStatus.INPROGRESS;
  //         this.stripeModal.show();
  //         // this.declineOtherOffers();
  //         /* -----------Update Contract Id in job Details */
  //         this.contractDetail.jobPostId['contractId'] = this.contractDetail._id;
  //         this.contractDetail.jobPostId['status'] = environment.JOB_STATUS.CONTRACT;
  //         const jobData = {
  //           _id: this.contractDetail.jobPostId._id,
  //           contractId: this.contractDetail._id,
  //           // ---- Added On 30 after contract created contract status filled
  //           status: environment.JOB_STATUS.CONTRACT
  //         };
  //         await this.updateJobDetails(jobData);
  //         // ------------------- Create Connection For Message App-----------
  //         // this.checkPreviousRecipents();
  //        // await this.sendNotificationToAdmin('adminPayment');
  //         await this.updateCalendar(environment.CALENDAR_STATUS.BOOKED);
  //         await this.declinedOfferList(this.currentContractDetails);
  //      // }
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
  //   });
  // }
  payAndActivatePracticeAccount() {
    // this.currentUser1.accepted.isActivated = 1;
    // let message = 'Thank you for the payment,';

    //   this.usersService.updateUser(this.currentUser1).subscribe(
    //         data => {
    //           if (data.status === 200) {
    //             this.closeModel();
    //             this.toastr.success(
    //               message,
    //               'Success'
    //             );
    //           } else {
    //             this.toastr.error(
    //               'There are some server Please check connection.',
    //               'Error'
    //             );
    //           }
    //           this.spinner.hide();
    //         },
    //         error => {
    //           this.spinner.hide();
    //           this.toastr.error(
    //             'There are some server Please check connection.',
    //             'Error'
    //           );
    //         }
    //       );
  }

  // openPaymentModal(type: string, work?: any){
  //   let obj = {t:type,w:work,i:0};
  //   const modalRef = this.modalService.open(ContractDetailsComponent);
  //   modalRef.componentInstance.data = obj;
  //   modalRef.result.then((result) => {
  //   this.ngOnInit();
  //   })
  // }

  @ViewChild('disputeModal', { static: false }) disputeModal: ModalDirective;
  @ViewChild('timesheetPayModal', { static: false }) timesheetPayModal: ModalDirective;
  @ViewChild('stripeSource', { static: false }) stripeSource: StripeSource;
  @ViewChild('stripeSource1', { static: false }) stripeSource1: StripeSource;
  @ViewChild('stripeModal', { static: false }) stripeModal: ModalDirective;
  @ViewChild('endContractModal', { static: false }) endContractModal: ModalDirective;
  selectedWork: any = new WorkDiary();
  selectedWorkIndex: any = -1;
  previousTimesheetDetails: any;
  disputeDetail: any = new Dispute();
  timeSheetPayment: Boolean = false;
  showApprove: Boolean  = false;
  workDiaryPaymentType = environment.WORKDIARY_PAYMENT_TYPE;
  offlinePaymentType = environment.OFFLINE_PAYMENT_TYPE;

  commissions: any = [];
  paymentDetails: any = new PaymentDetails();
  adminId: any;
  openPaymentModal(type: string, work?: any, selectedWorkIndex?: Number) {
    if (type === 'dispute') {
      // this.disputeModal.show();
    } else if (type === 'timesheet') {
      this.selectedWork = JSON.parse(JSON.stringify(work));
      this.selectedWorkIndex = selectedWorkIndex;
      //----- Added Condition for edit mode
      if (this.selectedWork.paidStatus === environment.RATING_STATUS.PENDING) {
        this.previousTimesheetDetails = JSON.parse(JSON.stringify(this.selectedWork.paymentDetails));
        //this.timesheetPayModal.show();
        this.selectedWork.paymentDetails.paymentType = environment.WORKDIARY_PAYMENT_TYPE.ONLINE;

       } 
      //else {
      //   this.toastr.success(
      //     'Already Payment had done',
      //     'Succcess');
      // }
    }
  }
  closeModal() {
    this.timeSheetPayment = false;
    this.cancelContractModal.hide();
    this.timesheetPayModal.hide();
    this.endContractModal.hide();
    this.disputeModal.hide();
  }

  addDisputes() {
    this.spinner.show();
    this.disputeDetail.contractId = this.contractDetail._id;
    this.disputeDetail.disputeUserId = this.contractDetail.practiceId._id;
    this.disputeDetail.status = environment.DISPUTE_STATUS.NEW;
    this.disputeService.addDispute(this.disputeDetail).subscribe(data => {
      this.disputeDetail = new Dispute();
      this.sendNotificationToAdmin('adminDisputes');
      this.disputeModal.hide();
      this.spinner.hide();
      this.toastr.success(
        'Disputed has been submtted to Administrator for reveiw.',
        'Success'
      );
    }, error => {
      this.spinner.hide();
      this.toastr.error(
        'There are some server Please check connection.',
        'Error'
      );
    });
  }


  getCommissionAmount() {
    const condition = {
      name: { '$eq': this.contractDetail.jobPostId.positionType }
    };
    this.positionTypeService.getPositionType({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.commissions = data.data;
          this.comissionAmount = data.data[0]['amount'];
        } else {
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

  onStripeInvalid(error: Error) {
    console.log('Validation Error', error);
  }

  assignContractDetails(){
      this.currentContractDetails = this.invitationsList1[0] ? this.invitationsList1[0]: this.offersList1[0] ;
      this.comissionAmount = this.selectedWork.totalAmount;
      this.contractDetail =  this.currentContractDetails;
  }

  setStripeSource(source: StripeSource) {
    this.spinner.show();
    const postObject = {
      source: source['id'],
    };
    // For workDiary payment
    const workdiaryAmount = this.comissionAmount; //this.selectedWork.totalAmount;
    let amount = this.globalService.stripeTotalAmt(workdiaryAmount);
    // if (!this.timeSheetPayment) {
    //   // Activate Contract Amount
    //   amount = this.globalService.stripeTotalAmt(this.comissionAmount);
    // } else {
    // For workDiary payment Add stripe Id of staff
    if(this.hireFlag){
    if (this.currentContractDetails.staffId.stripeId) {
      postObject['destination'] = this.currentContractDetails.staffId.stripeId;
    } else {
      //this.toastr.success('Please Check Connection.', 'Success');
    }
  }
    // }
    postObject['amount'] = amount;
    this.stripeService.createCharge(postObject).subscribe(
      async data => {
        if (data['status'] === 200) {
          this.paymentDetails.payerUserId = this.currentContractDetails.practiceId._id;
          this.paymentDetails.transactionId = data['data']['balance_transaction'];
          this.paymentDetails.amount = (data['data']['amount']) / 100;
          this.paymentDetails.mode = data['data']['source.type '];
          this.paymentDetails.status = data['data']['status'];
          this.paymentDetails.destination = data['data']['transfer_data']['destination'];
          this.paymentDetails.receiptURL = data['data']['receipt_url'];
          this.paymentDetails.jobPostId = this.currentContractDetails.jobPostId._id;
          if (this.timeSheetPayment) {
            this.stripeModal.hide();
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.WORKDIARY;
            this.paymentDetails.receiverUserId = this.currentContractDetails.staffId._id;
          } else {
            this.stripeModal.hide();
            this.paymentDetails.actionStatus = environment.PAYMENT_STATUS_TYPE.CONTRACT;
            // if (this.adminId) {
            //   this.paymentDetails.receiverUserId = this.adminId;
            // }
          }
          await this.addPaymentDetails();
          //this.toastr.success('Payment has been made.', 'Success');
          this.showApprove = false;
          if(this.hireFlag){
            this.sendNotificationApproveAndPay('timesheetPayment'); 
          }
        }
        this.spinner.hide();
      }
    );
  }

  addPaymentDetails() {
    this.spinner.show();
    this.paymentService.savePaymentDetails(this.paymentDetails).subscribe(async data => {
      if (data.status === 200) {
        // if (this.timeSheetPayment) {
        //   this.selectedWork.paymentDetails['paymentId'] = data.data._id;
        //   this.submitWorkDiary();
        // } else {
        this.currentContractDetails['paymentId'] = data.data._id;
        this.currentContractDetails.contractStatus = this.contractStatus.INPROGRESS;
        //this.stripeModal.show();
        // this.declineOtherOffers();
        /* -----------Update Contract Id in job Details */
        this.currentContractDetails.jobPostId['contractId'] = this.currentContractDetails._id;
        this.currentContractDetails.jobPostId['status'] = environment.JOB_STATUS.CONTRACT;
        // const jobData = {
        //   _id: this.currentContractDetails.jobPostId._id,
        //   contractId: this.currentContractDetails._id,

        //   status: environment.JOB_STATUS.CONTRACT
        // };
        // await this.updateJobDetails(jobData);
        // ------------------- Create Connection For Message App-----------

        // await this.updateCalendar(environment.CALENDAR_STATUS.BOOKED);
        // await this.declinedOfferList(this.currentContractDetails);
        // }
        if (this.methodFlag == 'acceptOfferWithPayment') {
          this.acceptOfferWithPayment(this.currentContractDetails, this.currentIndex);
        } else if(this.methodFlag ==  'acceptOfferByPracticeWithPayment' || this.methodFlag == 'undefined') {
          this.acceptOfferByPracticeWithPayment(this.currentContractDetails, this.currentIndex);
        }else if(this.methodFlag == 'timeSheetPayment'){
          this.submitWorkDiary(false);
          this.updatePaymentSheetDetails(this.currentContractDetails, this.currentIndex);
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
  updatePaymentSheetDetails(offerDetails: any, currentIndex: number) {
    this.offerDetails = offerDetails;
    const updateDetails = {
      status: this.offerStatus.CONTRACT,
      contractStatus: environment.CONTRACT_STATUS.COMPLETED,
      finalRate  : offerDetails.offerSteps[offerDetails.offerStatus].amount,
    };

    const condition = {
      _id: offerDetails._id,
      jobPostId: offerDetails.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          const newJob = {
            _id: this.offerDetails.jobPostId._id,
            status: environment.JOB_STATUS.COMPLETED
          };
          //this.removedChangeJobStatus();
          //---Removed to contract status 30 May
          this.changeJobStatus(newJob);
        }
      });

  }


  declinedOfferListt() {
    // this.spinner.show();
    const condition = {
      _id: { $ne: this.contractDetail._id },
      jobPostId: this.contractDetail.jobPostId._id,
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
          this.declineOtherOfferss();
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

  declineOtherOfferss() {
    const offerDecline = {
      reason: 'Job is no longer available',
      declineTime: moment().toISOString(),
      declineBy: environment.USER_TYPE.PRACTICE,
    };
    const updateDetails = {
      status: this.offerStatus.DECLINE,
      offerDecline: offerDecline
    };
    const condition = {
      _id: { $ne: this.contractDetail._id },
      $or: [
        { status: this.offerStatus.OFFER },
        { status: this.offerStatus.CONTRACT }
      ],
      jobPostId: this.contractDetail.jobPostId._id
    };
    this.offerService.updateMultipleOffer({ condition, updateDetails }).subscribe(
      data => {
        if (data.status === 200) {
          this.sendDeclinedNotification('decline', offerDecline.reason);
          // this.common.incDecUsersCount(this.contractDetail.practiceId, 'staffHired', true);
          // this.common.incDecUsersCount(this.contractDetail.staffId, 'jobs', true);
          this.updateOfferStatus('Contract has been activated.', 'activateContract');
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


  sendNotificationToAdmin(type) {
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const notification = environment.notification;
    const currentTime = new Date().getTime();
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.adminId,
      message: notification[type].msg.replace('#NAME', fullName),
      redirectLink: notification[type].link,
      type: notification[type].type,
      admin: (type === 'adminDisputes') ? { payment: 0, disputes: 1 } : { payment: 1, disputes: 0 },
      jobId: this.contractDetail.jobPostId._id,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }


  submitTimesheetPayment() {
    if (this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.OFFLINE) {
      this.submitWorkDiary(true);
      this.timeSheetPayment = false;
      this.showOfflineMode = true;
      this.showApprove = false;
      this.sendNotificationApproveAndPay('timesheetPayment');
    } else {
      this.methodFlag = 'timeSheetPayment';
      this.timeSheetPayment = true;
      this.stripeSource1.createSource();
      //this.stripeSource1.createSource();
     // this.submitWorkDiary(false);
    }
  }

  onStripeError(error: Error) {
    console.error('Stripe error', error);
  }

  submitWorkDiary(paymentFlag) {
    if (this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.ONLINE) {
      this.selectedWork.paymentDetails.paymentDesc = '';
    }else if(this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.OFFLINE && this.selectedWork.offlinePyamentType !== this.offlinePaymentType.OTHER){
      this.selectedWork.paymentDetails.paymentDesc = '';
    } 
    this.spinner.show();
    const ischanged = JSON.stringify(this.previousTimesheetDetails) !== JSON.stringify(this.selectedWork.paymentDetails);
    // if (!ischanged && paymentFlag) {
    //   this.timesheetPayModal.hide();
    //   return false;
    // }
    if(this.markAsPaid){
      this.contractDetail.contractStatus = environment.CONTRACT_STATUS.MARKASPAID;
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.MARKASPAID;
    }else{
      this.contractDetail.contractStatus = environment.CONTRACT_STATUS.COMPLETED;
      this.contractDetail.jobPostId.status = environment.JOB_STATUS.COMPLETED;
    }
     
    this.selectedWork.paidStatus = environment.WORKDIARY_PAID_STATUS.PAID;
    this.selectedWork.timeClockStatus = environment.TIMESHEET_STATUS.APPROVED;
    const jobData = {
      _id: this.contractDetail.jobPostId._id,
      status: this.markAsPaid ? environment.JOB_STATUS.MARKASPAID :environment.JOB_STATUS.COMPLETED
    };
    this.updateJobDetails(jobData);
    this.updateOfferContractStatus(this.contractDetail.contractStatus);
    this.selectedWork.paidDate = new Date();
    this.workDiaryService.addWork(this.selectedWork).subscribe(data => {
      
      if (data.status === 200) {
        this.spinner.hide();
        this.timesheetPayModal.hide();
        if (this.selectedWorkIndex > -1) {
          this.timesheet[this.selectedWorkIndex] = this.selectedWork;
          this.newTimesheet[this.selectedWorkIndex] = this.selectedWork;
        };
        //move to Payment tab
        this.selectedJobTab = 3;
        

         //get offer and send notification
         const condition = {
          _id: this.selectedWork.contractId._id,                  
        };

        this.offerService.getOffer({condition}).subscribe(
          data=>{
            if(data.status ===200){
             
              //this.sendNotificationWithOffer('workDiaryPayment',data.data);
            }
          }
        );


        
        // Add WorkDiary Hours
        let totalHours = 0;
        totalHours = this.selectedWork.totalTime.hours + (Number((this.selectedWork.totalTime.minutes / 60).toFixed(1)));
        const newDetails = (new WorkDiary()).paymentDetails;
        delete newDetails['paymentId'];
        //this.ngOnInit();

        //set payment flags
        if (this.selectedWork.paymentDetails.paymentType === this.workDiaryPaymentType.ONLINE) {
          this.showPaymentFlag =true;
        }else{
          this.showOfflinePayment =true;
        }
        //this.getPaymentDetails(this.selectedWork.staffId._id);
          this.getJobDetails();
          this.getOffers();
          this.getInvitations();
          this.getAllPositionTypes();
     
        


        // const isFirstTimeDetails = (JSON.stringify(newDetails) ===
        //                   JSON.stringify(this.previousTimesheetDetails)
        //               );
        // if (ischanged && isFirstTimeDetails ) {
        //   this.common.incDecUsersCount(this.contractDetail.staffId, 'hours', true, totalHours);
        //   this.common.incDecUsersCount(this.contractDetail.practiceId, 'hours', true, totalHours);
        // }

        
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

  updateOfferContractStatus(status) {
    this.spinner.show();
    const condition = {
      practiceId: this.currentUser._id,
      jobPostId: this.contractDetail.jobPostId._id,
    };
    this.offerService.getAllOffers({ condition }).subscribe(data => {
      if (data.status === 200) {
        const offer = data.data[0];
        offer.contractStatus = status;
        this.offerService.addOffer(offer).subscribe(data => {
          if (data.status === 200) {
            this.toastr.success('Payment has been made successfully', 'Success');
          } else {
            this.toastr.error('There are some server. Please check connection.', 'Error');
          }
        })
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.toastr.error('There are some server. Please check connection.', 'Error');
    });
  }
  getStripeAmount(amount) {
    return this.globalService.stripeTotalAmt((amount)) / 100;
  }

  checkStatusAndChangeTheTab(list){
    if(this.hireFlag){
      list.forEach(element => {
        if(this.tabCount==0){
          if(element.jobPostId.status == this.jobStatus.FILLED){
            this.tabCount = 1;
          }
          if(element.jobPostId.status == this.jobStatus.INPROGRESS){
            this.tabCount = 1;
          }
          if(element.jobPostId.status == this.jobStatus.PAYTOACTIVATE){
            this.tabCount = 2;
            this.changeTimeSheetStatus();
          }
          if(element.jobPostId.status == this.jobStatus.COMPLETED){
            if(element.jobPostId.jobType !== this.jobType.TEMPORARY){
              this.tabCount = 1;
            }else{
              this.tabCount = 3;
            }
          }
        }else if(this.tabCount==1){
          if(element.jobPostId.status == this.jobStatus.PAYTOACTIVATE){
            this.tabCount = 2;
            this.changeTimeSheetStatus();
          }
          if(element.jobPostId.status == this.jobStatus.COMPLETED){
            this.tabCount = 3;
          }
        }else if(this.tabCount==2){
          if(element.jobPostId.status == this.jobStatus.PAYTOACTIVATE){
            this.tabCount = 2;
            this.changeTimeSheetStatus();
          }
          if(element.jobPostId.status == this.jobStatus.COMPLETED){
            this.tabCount = 3;
          }
        }      
      });
      this.selectedJobTab = this.tabCount;
    }


  }
  showDescripton(jobDescription){
    this.currentJobDescription = jobDescription;
    this.jobDescription.show();
  }
  getAllPositionTypes(){
    const condition = {
    };
    this.positionTypeService.getPositionType({ condition }).subscribe(data => {
      if (data.status === 200) {
        if (data.data.length > 0) {
          this.allPositions = data.data;
        } else {
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
  mergePositionType(data){
    data.forEach(elementOfData => {
      if(elementOfData.staffId.positionType){
        this.allPositions.forEach(elementOfPostion => {
          if(elementOfData.staffId.positionType === elementOfPostion._id){
            elementOfData.staffId.positionType = elementOfPostion;
          }
        });
      }
    });
  }

  viewReason(cancelContract){
    this.cancelContractDetail = cancelContract;
    this.viewCancleModal.show();
  }

  getConditionStatus(currentOffer) {
    if(currentOffer.offerStatus === environment.OFFER_TYPE.INITIAL && (currentOffer.status === environment.OFFER_STATUS_NEW.APPLYED || currentOffer.status === environment.OFFER_STATUS_NEW.OFFER)){
      return '<span >Applicant is waiting for your approval</span>';
    }
    else if (currentOffer.offerStatus === environment.OFFER_TYPE.COUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span >Applicant is waiting for your approval</span>';
    }
    else if (currentOffer.offerStatus === environment.OFFER_TYPE.RECOUNTER && currentOffer.status === environment.OFFER_STATUS_NEW.OFFER) {
      return '<span >Awaiting applicant’s response </span>';
    }
    else if(currentOffer.status === environment.OFFER_STATUS_NEW.DECLINE){
      if(currentOffer.offerDecline.declineBy === environment.USER_TYPE.STAFF){
        return '<span >Declined by Applicant</span>';
      }else{
        return '<span >Declined by practice</span>';
      }
      
    }

  }
  isCancelJob(data){
    data.forEach(element => {
      if(this.jobDetail._id === element.jobPostId._id && element.contractStatus === this.jobStatus.CANCELLED){
        this.jobDetail.cancelContract = element.cancelContract;
      }
    });
  }

  moveToPayment(){
    this.timesheetPayModal.hide()
    this.selectedJobTab = 3;
  }

  approveTimesheet(){
    this.timesheetPayModal.show();
    this.selectedWork.timeClockStatus = environment.TIMESHEET_STATUS.ANP;
    //this.selectedWork.paidDate = new Date();
    this.workDiaryService.addWork(this.selectedWork).subscribe(data => {
      if (data.status === 200) {
        this.showApprove  = true;
        this.sendNotificationApproveAndPay('timesheetApproved');
      }
    });
  }

  openTimeSheet(){
    this.selectedJobTab = 2;
  }

  changePaymentMode(values: any){
    this.checkSign = values.currentTarget.checked;
    this.showOfflineMode = true;
    if(values.currentTarget.checked){
      this.showOfflineMode = true;
    }else{
      this.showOfflineMode = false;
    }
  }

  markAsPaidOfflinePayment(){
    this.selectedWork.paymentDetails.paymentType = this.workDiaryPaymentType.OFFLINE;
    this.markAsPaid = true;
    this.submitTimesheetPayment();
  }

  sendNotificationApproveAndPay(type){
    const fullName = this.currentUser.firstName + ' ' + this.currentUser.lastName;
    const title = this.globalService.titleCase(this.jobDetail.jobTitle.toString());
    const jobId = this.jobDetail._id;
    const currentTime = new Date().getTime();
    const currentDate = moment(new Date).format('DD-MM-YYYY');
    const notification = environment.notification;
    let id = this.currentContractDetails._id;
    this.notification = {
      senderId: this.currentUser._id,
      receiverId: this.currentContractDetails.staffId._id,
      message: notification[type].msg.replace('#TITLE', title).replace('#NAME', fullName).replace('#DATE',currentDate),
      redirectLink: notification[type].staffLink + id,
      type: notification[type].type,
      jobId: jobId,
      createdAt: currentTime,
      updatedAt: currentTime,
      status: environment.notificationStatus.UNREAD
    };
    this.firebaseService.createNotification(this.notification);
  }

  openJobList(){
    this.jobsService.showLeftMenuForJobs = false;
    this.jobsService.fetchRoute = this.router.url;
  }

  getRatingsCount() {
    var condition = {
      staffId : {$eq : this.offerDetails.staffId._id},
      ratedBy : {$eq : environment.USER_TYPE.PRACTICE},
      status  : environment.RATING_STATUS.DONE
    };
  
    this.ratingService.getRatings({condition: condition}).subscribe(async data => {
      if (data.status === 200) {
          if (data.data) {
            this.ratingCount = data.data.length;
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

  showNegotiateMsfg(){
    if(this.jobDetail.jobType === this.jobTypes.TEMPORARY){
      this.msgDisplayed = true;
      this.toastr.success('To submit an application with counter offer, you must at least change one of the following parameters: start time, end time and / or the rate. Please review and accept Densub’s terms and conditions','Alert',{timeOut:10000})
    }else{
    this.toastr.success('To submit an application with counter offer, you must change the pay rate','Alert',{timeOut:10000})
    }
  }

  changeMsgColor(){
    this.msgDisplayed = false;
  }
}
